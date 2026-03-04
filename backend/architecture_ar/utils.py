"""
Utilities for the architecture_ar app.

Provides file conversion helpers that abstract away the underlying
FBX2glTF binary, which is installed in the Docker image via the Dockerfile.

Both environments use the same Dockerfile:
  - Local dev:  docker-compose (target: development)
  - Production: Render         (target: production)

The binary is installed in /usr/local/bin/FBX2glTF (system PATH) during
the Docker build step, so it is always available to the Django process.
"""

import shutil
import subprocess
import tempfile
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Formats that require conversion to GLB
FORMATS_REQUIRING_CONVERSION = {".fbx", ".obj"}

# Formats already compatible with Unity — no conversion needed
FORMATS_ACCEPTED_AS_IS = {".glb", ".gltf"}

# All allowed extensions (union of both sets)
ALLOWED_3D_EXTENSIONS = sorted(
    FORMATS_REQUIRING_CONVERSION | FORMATS_ACCEPTED_AS_IS
)


def _get_fbx2gltf_path() -> str:
    """
    Locate the FBX2glTF executable in the system PATH.

    The binary is installed at /usr/local/bin/FBX2glTF by the Dockerfile,
    shared between local (docker-compose) and production (Render) environments.

    Raises:
        FileNotFoundError: Binary missing — image must be rebuilt.
    """
    binary = shutil.which("FBX2glTF")
    if binary:
        return binary

    raise FileNotFoundError(
        "FBX2glTF binary not found in system PATH. "
        "Please rebuild the Docker image: 'docker-compose build backend'."
    )


# ---------------------------------------------------------------------------
# Conversion logic
# ---------------------------------------------------------------------------

def convert_to_glb(input_bytes: bytes, original_filename: str) -> bytes:
    """
    Convert a 3D model file (FBX, OBJ) to binary GLB format.

    This function is environment-agnostic: it writes the input bytes
    to a temporary file, calls FBX2glTF, reads back the result, and
    cleans up. All I/O is done in /tmp so it works with both local
    storage and S3  (the caller is responsible for persisting the result).

    Args:
        input_bytes:       Raw bytes of the uploaded file.
        original_filename: Original filename (used to detect extension).

    Returns:
        bytes: GLB file content.

    Raises:
        FileNotFoundError:   FBX2glTF binary is missing.
        ValueError:          The file extension is not a convertible format.
        RuntimeError:        FBX2glTF process failed.
        TimeoutError:        Conversion took too long (> 120 s).
    """
    ext = Path(original_filename).suffix.lower()

    if ext not in FORMATS_REQUIRING_CONVERSION:
        raise ValueError(
            f"Extension '{ext}' does not need conversion. "
            f"Only {FORMATS_REQUIRING_CONVERSION} are converted."
        )

    binary_path = _get_fbx2gltf_path()

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_dir_path = Path(tmp_dir)
        input_path = tmp_dir_path / Path(original_filename).name
        # FBX2glTF outputs <stem>.glb next to the input file by default
        output_path = tmp_dir_path / (input_path.stem + ".glb")

        # Write the uploaded bytes to disk for FBX2glTF to read
        input_path.write_bytes(input_bytes)

        cmd = [
            binary_path,
            "--binary",            # Force .glb (binary GLTF) output
            "--input", str(input_path),
            "--output", str(output_path),
        ]

        logger.info("Starting FBX→GLB conversion: %s", original_filename)

        try:
            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=120,  # 2-minute hard limit to avoid blocking workers
            )
        except subprocess.TimeoutExpired:
            raise TimeoutError(
                f"FBX2glTF timed out after 120 s while converting '{original_filename}'. "
                "The file may be too complex or corrupted."
            )

        if result.returncode != 0:
            error_detail = result.stderr.decode(errors="replace").strip()
            logger.error("FBX2glTF failed for '%s': %s", original_filename, error_detail)
            raise RuntimeError(
                f"3D model conversion failed for '{original_filename}'. "
                f"Detail: {error_detail}"
            )

        if not output_path.exists():
            raise RuntimeError(
                f"FBX2glTF succeeded (exit 0) but output file was not created: {output_path}"
            )

        glb_bytes = output_path.read_bytes()
        logger.info(
            "Conversion successful: %s → %s (%.2f KB)",
            original_filename,
            output_path.name,
            len(glb_bytes) / 1024,
        )
        return glb_bytes
