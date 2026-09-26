import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import UploadCard from "../components/ui/UploadCard";
import ProgressBar from "../components/ui/ProgressBar";
import CompletedItem from "../components/ui/CompletedItem";
import ToggleSwitch from "../components/ui/ToggleSwitch";
import NeonButton from "../components/ui/NeonButton";
import {
  createTrackingImage,
  setTrackingImageVisibility,
  uploadTrackingVideo,
  getTrackingImages,
  TrackingImage,
} from "../api/ImageTracking";
import { useAuthStore } from "../hooks/useAuthStore";

interface UploadState {
  title: string;
  imageFile: File | null;
  videoFile: File | null;
  isPublic: boolean;
  imagePreview: string | null;
  videoPreview: string | null;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "940:788";
  uploading: boolean;
  progress: number;
}

const ALLOWED_VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "avi"];

const hasAllowedVideoExtension = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return (
    extension !== undefined && ALLOWED_VIDEO_EXTENSIONS.includes(extension)
  );
};

export default function ImageTrackingPage() {
  const user = useAuthStore((s) => s.user);
  const [state, setState] = useState<UploadState>({
    title: "",
    imageFile: null,
    videoFile: null,
    isPublic: false,
    imagePreview: null,
    videoPreview: null,
    aspectRatio: "16:9",
    uploading: false,
    progress: 0,
  });
  const [projects, setProjects] = useState<TrackingImage[]>([]);
  const [updatingVisibility, setUpdatingVisibility] = useState<number | null>(
    null
  );

  // Fetch projects on load
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await getTrackingImages();
        setProjects(Array.isArray(data) ? data : data.results || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  // Límites sincronizados con el backend
  const MAX_IMAGE_SIZE_MB = 2;
  const MAX_VIDEO_SIZE_MB = 50;

  const handleImageSelect = useCallback((file: File) => {
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_IMAGE_SIZE_MB) {
      toast.error(
        `La imagen pesa ${sizeMb.toFixed(
          1
        )} MB. El límite máximo es ${MAX_IMAGE_SIZE_MB} MB.`
      );
      return;
    }

    const preview = URL.createObjectURL(file);
    setState((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: preview,
      title: prev.title || file.name.split(".")[0],
    }));
    toast.success(`Imagen seleccionada: ${file.name}`);
  }, []);

  const handleVideoSelect = useCallback((file: File) => {
    if (!hasAllowedVideoExtension(file)) {
      toast.error(
        `Formato de video no permitido. Usa: ${ALLOWED_VIDEO_EXTENSIONS.join(
          ", "
        ).toUpperCase()}.`
      );
      return;
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_VIDEO_SIZE_MB) {
      toast.error(
        `El video pesa ${sizeMb.toFixed(
          1
        )} MB. El límite máximo es ${MAX_VIDEO_SIZE_MB} MB.`
      );
      return;
    }

    const preview = URL.createObjectURL(file);
    setState((prev) => ({ ...prev, videoFile: file, videoPreview: preview }));
    toast.success(`Video seleccionado: ${file.name}`);
  }, []);

  const handleUpload = async () => {
    if (!state.imageFile || !state.videoFile) {
      toast.error("Selecciona una imagen y un video");
      return;
    }

    if (!hasAllowedVideoExtension(state.videoFile)) {
      toast.error(
        `Formato de video no permitido. Usa: ${ALLOWED_VIDEO_EXTENSIONS.join(
          ", "
        ).toUpperCase()}.`
      );
      return;
    }

    const imageMb = state.imageFile.size / (1024 * 1024);
    if (imageMb > MAX_IMAGE_SIZE_MB) {
      toast.error(`La imagen supera los ${MAX_IMAGE_SIZE_MB} MB permitidos.`);
      return;
    }

    const videoMb = state.videoFile.size / (1024 * 1024);
    if (videoMb > MAX_VIDEO_SIZE_MB) {
      toast.error(
        `El video supera los ${MAX_VIDEO_SIZE_MB} MB permitidos (${videoMb.toFixed(
          1
        )} MB).`
      );
      return;
    }

    setState((prev) => ({ ...prev, uploading: true, progress: 0 }));

    try {
      // Step 1: Upload image
      const imageData = new FormData();
      imageData.append("image", state.imageFile);
      imageData.append("title", state.title || state.imageFile.name);
      imageData.append("aspect_ratio", state.aspectRatio);
      imageData.append("is_public", String(state.isPublic));

      setState((prev) => ({ ...prev, progress: 30 }));
      const { data: imageResult } = await createTrackingImage(imageData);

      // Step 2: Upload video
      const videoData = new FormData();
      videoData.append("video", state.videoFile);
      videoData.append("title", state.videoFile.name);

      setState((prev) => ({ ...prev, progress: 70 }));
      await uploadTrackingVideo(imageResult.id, videoData);

      setState((prev) => ({ ...prev, progress: 100 }));

      // Refresh list
      const { data } = await getTrackingImages();
      setProjects(Array.isArray(data) ? data : data.results || []);

      toast.success("¡Proyecto AR subido exitosamente!");

      // Reset form
      setTimeout(() => {
        setState({
          title: "",
          imageFile: null,
          videoFile: null,
          isPublic: false,
          imagePreview: null,
          videoPreview: null,
          aspectRatio: "16:9",
          uploading: false,
          progress: 0,
        });
      }, 1000);
    } catch (error: any) {
      console.error("Error al subir:", error);
      const serverMsg = error.response?.data
        ? JSON.stringify(error.response.data)
        : "Error al subir. Intenta de nuevo.";
      toast.error(`Error: ${serverMsg}`);
      setState((prev) => ({ ...prev, uploading: false, progress: 0 }));
    }
  };

  const handleVisibilityChange = async (
    projectId: number,
    isPublic: boolean
  ) => {
    if (updatingVisibility !== null) return;

    setUpdatingVisibility(projectId);
    try {
      await setTrackingImageVisibility(projectId, isPublic);
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === projectId
            ? { ...project, is_public: isPublic }
            : project
        )
      );
      toast.success(
        isPublic
          ? "Proyecto publicado en el catálogo."
          : "Proyecto marcado como privado."
      );
    } catch {
      toast.error("No se pudo cambiar la visibilidad del proyecto.");
    } finally {
      setUpdatingVisibility(null);
    }
  };

  return (
    <div className="px-5 sm:px-8 md:px-10 py-8 pb-32 lg:pb-12 flex flex-col gap-8 md:gap-10 max-w-4xl mx-auto">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Image AR Studio
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl leading-relaxed">
          Sube una imagen y un video. Al escanear la imagen con el App, la
          imagen cobrará vida interactivamente.
        </p>
      </motion.div>

      {/* Project Name Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block ml-1">
          Nombre del Proyecto
        </label>
        <input
          type="text"
          value={state.title}
          onChange={(e) =>
            setState((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Ej: Mi Increíble Aumento"
          className="w-full bg-white/2 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
        />
      </motion.div>

      {/* Aspect Ratio Selector - Compact Version */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/2 p-3 px-4 rounded-2xl border border-white/5"
      >
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs font-bold uppercase tracking-widest">
            Relación:
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() =>
              setState((prev) => ({ ...prev, aspectRatio: "16:9" }))
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
              state.aspectRatio === "16:9"
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                : "bg-white/2 border-white/5 text-slate-500 hover:bg-white/5"
            }`}
          >
            <span className="material-symbols-outlined text-base leading-none">
              rectangle
            </span>
            <span className="text-xs font-bold tracking-tight">16:9</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setState((prev) => ({ ...prev, aspectRatio: "9:16" }))
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
              state.aspectRatio === "9:16"
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                : "bg-white/2 border-white/5 text-slate-500 hover:bg-white/5"
            }`}
          >
            <span className="material-symbols-outlined text-base leading-none rotate-90">
              rectangle
            </span>
            <span className="text-xs font-bold tracking-tight">9:16</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setState((prev) => ({ ...prev, aspectRatio: "1:1" }))
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
              state.aspectRatio === "1:1"
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                : "bg-white/2 border-white/5 text-slate-500 hover:bg-white/5"
            }`}
          >
            <span className="material-symbols-outlined text-base leading-none">
              square
            </span>
            <span className="text-xs font-bold tracking-tight">1:1</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setState((prev) => ({ ...prev, aspectRatio: "4:3" }))
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
              state.aspectRatio === "4:3"
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                : "bg-white/2 border-white/5 text-slate-500 hover:bg-white/5"
            }`}
          >
            <span className="material-symbols-outlined text-base leading-none">
              crop_landscape
            </span>
            <span className="text-xs font-bold tracking-tight">
              4:3 Portarretrato
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setState((prev) => ({ ...prev, aspectRatio: "940:788" }))
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
              state.aspectRatio === "940:788"
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                : "bg-white/2 border-white/5 text-slate-500 hover:bg-white/5"
            }`}
          >
            <span className="material-symbols-outlined text-base leading-none">
              facebook
            </span>
            <span className="text-xs font-bold tracking-tight">Facebook</span>
          </button>
        </div>
      </motion.div>

      {/* Production Hints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
      >
        {/* Image Hints */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase tracking-widest bg-white/2 px-2.5 py-1 rounded-md border border-white/5">
            <span className="material-symbols-outlined text-[12px] text-cyan-500/70">
              image
            </span>
            <span>IMG:</span>
            <span className="text-slate-300">
              {state.aspectRatio === "16:9"
                ? "1920x1080"
                : state.aspectRatio === "9:16"
                ? "1080x1920"
                : state.aspectRatio === "1:1"
                ? "1080x1080"
                : state.aspectRatio === "4:3"
                ? "1440x1080 (4:3)"
                : "940x788"}
            </span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="text-slate-400">MAX 2MB</span>
          </div>
        </div>

        {/* Video Hints */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase tracking-widest bg-white/2 px-2.5 py-1 rounded-md border border-white/5">
            <span className="material-symbols-outlined text-[12px] text-violet-500/70">
              movie
            </span>
            <span>VIDEO:</span>
            <span className="text-slate-300">
              {state.aspectRatio === "16:9"
                ? "16:9 MP4"
                : state.aspectRatio === "9:16"
                ? "9:16 MP4"
                : state.aspectRatio === "1:1"
                ? "1:1 MP4"
                : state.aspectRatio === "4:3"
                ? "4:3 MP4"
                : "940:788 MP4"}
            </span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="text-slate-400">MAX 50MB</span>
          </div>
        </div>
      </motion.div>

      {/* Upload cards - Dynamic aspect ratio */}
      <div
        className={`grid gap-6 md:gap-8 transition-all duration-500 w-full ${
          state.aspectRatio === "9:16"
            ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
            : state.aspectRatio === "1:1"
            ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto"
            : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        <UploadCard
          icon="image"
          title="Imagen de Seguimiento"
          formats="JPG, PNG, WEBP"
          accept="image/*,.jpg,.jpeg,.png,.webp"
          onFileSelect={handleImageSelect}
          disabled={state.uploading}
          previewUrl={state.imagePreview}
          aspectRatio={state.aspectRatio}
        />

        <UploadCard
          icon="movie"
          title="Video de Aumento"
          formats="MP4, MOV, WebM, AVI"
          accept=".mp4,.MP4,.mov,.MOV,.webm,.WEBM,.avi,.AVI"
          onFileSelect={handleVideoSelect}
          disabled={state.uploading}
          previewUrl={state.videoPreview}
          isVideoPreview
          aspectRatio={state.aspectRatio}
        />
      </div>

      {/* Preview + settings */}
      {(state.imageFile || state.videoFile) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/2 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Detalles del Proyecto
            </h3>
            {state.imagePreview && (
              <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10">
                <img
                  src={state.imagePreview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              </div>
            )}
          </div>

          {/* Selected files summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.imageFile && (
              <div
                className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                  state.imageFile.size / (1024 * 1024) > MAX_IMAGE_SIZE_MB
                    ? "bg-red-500/10 border-red-500/30 text-red-300"
                    : "bg-white/5 border-white/5"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                    state.imageFile.size / (1024 * 1024) > MAX_IMAGE_SIZE_MB
                      ? "bg-red-500/20 text-red-400"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined">image</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate text-slate-200">
                    {state.imageFile.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-[10px] uppercase font-mono font-bold ${
                        state.imageFile.size / (1024 * 1024) > MAX_IMAGE_SIZE_MB
                          ? "text-red-400"
                          : "text-slate-500"
                      }`}
                    >
                      {(state.imageFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    {state.imageFile.size / (1024 * 1024) >
                      MAX_IMAGE_SIZE_MB && (
                      <span className="text-[10px] text-red-400 font-bold bg-red-500/20 px-1.5 py-0.5 rounded">
                        Máx {MAX_IMAGE_SIZE_MB}MB
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {state.videoFile && (
              <div
                className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                  state.videoFile.size / (1024 * 1024) > MAX_VIDEO_SIZE_MB
                    ? "bg-red-500/10 border-red-500/30 text-red-300"
                    : "bg-white/5 border-white/5"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                    state.videoFile.size / (1024 * 1024) > MAX_VIDEO_SIZE_MB
                      ? "bg-red-500/20 text-red-400"
                      : "bg-secondary/20 text-secondary"
                  }`}
                >
                  <span className="material-symbols-outlined">movie</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate text-slate-200">
                    {state.videoFile.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-[10px] uppercase font-mono font-bold ${
                        state.videoFile.size / (1024 * 1024) > MAX_VIDEO_SIZE_MB
                          ? "text-red-400"
                          : "text-slate-500"
                      }`}
                    >
                      {(state.videoFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    {state.videoFile.size / (1024 * 1024) >
                      MAX_VIDEO_SIZE_MB && (
                      <span className="text-[10px] text-red-400 font-bold bg-red-500/20 px-1.5 py-0.5 rounded">
                        Máx {MAX_VIDEO_SIZE_MB}MB
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-white/5" />

          {/* Public toggle - ONLY FOR ADMINS */}
          {user?.is_admin && (
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <ToggleSwitch
                checked={state.isPublic}
                onChange={(checked) =>
                  setState((prev) => ({ ...prev, isPublic: checked }))
                }
                label="Visibilidad Pública"
                description="Permitir que otros usuarios vean este aumento en el catálogo global."
              />
            </div>
          )}

          {/* Alerta si algún archivo excede el tamaño */}
          {((state.imageFile &&
            state.imageFile.size / (1024 * 1024) > MAX_IMAGE_SIZE_MB) ||
            (state.videoFile &&
              state.videoFile.size / (1024 * 1024) > MAX_VIDEO_SIZE_MB)) && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <span className="material-symbols-outlined text-red-400 shrink-0">
                warning
              </span>
              <span>
                {state.videoFile &&
                state.videoFile.size / (1024 * 1024) > MAX_VIDEO_SIZE_MB
                  ? `El video pesa ${(
                      state.videoFile.size /
                      1024 /
                      1024
                    ).toFixed(
                      1
                    )} MB. Debes comprimirlo o elegir uno menor a ${MAX_VIDEO_SIZE_MB} MB antes de subir.`
                  : `La imagen pesa ${(
                      state.imageFile!.size /
                      1024 /
                      1024
                    ).toFixed(
                      1
                    )} MB. El límite máximo es ${MAX_IMAGE_SIZE_MB} MB.`}
              </span>
            </div>
          )}

          <NeonButton
            fullWidth
            onClick={handleUpload}
            disabled={
              !state.imageFile ||
              !state.videoFile ||
              state.uploading ||
              state.imageFile.size / (1024 * 1024) > MAX_IMAGE_SIZE_MB ||
              state.videoFile.size / (1024 * 1024) > MAX_VIDEO_SIZE_MB
            }
            className="h-12 md:h-14 text-base md:text-lg"
          >
            <span className="material-symbols-outlined">
              {state.uploading ? "sync" : "rocket_launch"}
            </span>
            {state.uploading
              ? `Subiendo ${state.progress}%`
              : state.videoFile &&
                state.videoFile.size / (1024 * 1024) > MAX_VIDEO_SIZE_MB
              ? `Video Excede ${MAX_VIDEO_SIZE_MB}MB`
              : state.imageFile &&
                state.imageFile.size / (1024 * 1024) > MAX_IMAGE_SIZE_MB
              ? `Imagen Excede ${MAX_IMAGE_SIZE_MB}MB`
              : "Lanzar Proyecto AR"}
          </NeonButton>
        </motion.div>
      )}

      {/* Active uploads */}
      {state.uploading && (
        <section className="flex flex-col gap-4 bg-primary/5 p-6 rounded-3xl border border-primary/20">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/70 font-mono">
              ENGINE_PROCESS :: UPLOADING
            </h3>
            <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-full border border-primary/30 animate-pulse">
              LIVE
            </span>
          </div>
          <ProgressBar
            filename={state.imageFile?.name || "Procesando archivos..."}
            progress={state.progress}
            icon="memory"
          />
        </section>
      )}

      {/* List of User's Projects */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
            Biblioteca Local ({projects.length})
          </h3>
          <div className="h-px bg-white/5 w-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projects.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl opacity-40">
              <span className="material-symbols-outlined text-4xl mb-2">
                folder_off
              </span>
              <p className="text-sm italic">
                No hay proyectos en tu biblioteca todavía.
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="flex flex-col gap-2">
                <CompletedItem
                  filename={project.title}
                  thumbnailUrl={project.image_url}
                  meta={`${project.aspect_ratio} • ${
                    project.is_public ? "🌐 Cloud" : "🔒 Private"
                  } • ${new Date(project.created_at).toLocaleDateString()}`}
                />
                {user?.is_admin && (
                  <div className="px-3">
                    <ToggleSwitch
                      checked={project.is_public}
                      onChange={(isPublic) =>
                        handleVisibilityChange(project.id, isPublic)
                      }
                      disabled={updatingVisibility === project.id}
                      label={project.is_public ? "Público" : "Privado"}
                      description={
                        updatingVisibility === project.id
                          ? "Guardando cambio..."
                          : "Visibilidad en el catálogo público"
                      }
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
