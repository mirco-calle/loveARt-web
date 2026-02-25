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
  uploadTrackingVideo,
  getTrackingImages,
  TrackingImage,
} from "../api/ImageTracking";

interface UploadState {
  imageFile: File | null;
  videoFile: File | null;
  isPublic: boolean;
  imagePreview: string | null;
  aspectRatio: "16:9" | "9:16";
  uploading: boolean;
  progress: number;
}

export default function ImageTrackingPage() {
  const [state, setState] = useState<UploadState>({
    imageFile: null,
    videoFile: null,
    isPublic: false,
    imagePreview: null,
    aspectRatio: "16:9",
    uploading: false,
    progress: 0,
  });
  const [projects, setProjects] = useState<TrackingImage[]>([]);

  // Fetch projects on load
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await getTrackingImages();
        // Assuming API returns { results: [...] } based on interface, but checking structure
        setProjects(Array.isArray(data) ? data : data.results || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const handleImageSelect = useCallback((file: File) => {
    const preview = URL.createObjectURL(file);
    setState((prev) => ({ ...prev, imageFile: file, imagePreview: preview }));
    toast.success(`Imagen seleccionada: ${file.name}`);
  }, []);

  const handleVideoSelect = useCallback((file: File) => {
    setState((prev) => ({ ...prev, videoFile: file }));
    toast.success(`Video seleccionado: ${file.name}`);
  }, []);
  // ... (rest of the file)
  const handleUpload = async () => {
    if (!state.imageFile || !state.videoFile) {
      toast.error("Selecciona una imagen y un video");
      return;
    }

    setState((prev) => ({ ...prev, uploading: true, progress: 0 }));

    try {
      // Step 1: Upload image
      const imageData = new FormData();
      imageData.append("image", state.imageFile);
      imageData.append("title", state.imageFile.name);
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
          imageFile: null,
          videoFile: null,
          isPublic: false,
          imagePreview: null,
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
          Sube una foto y un video. Al escanear la foto en la vida real, el
          video cobrará vida magnéticamente.
        </p>
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

        <div className="flex gap-1.5">
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
              {state.aspectRatio === "16:9" ? "1920x1080" : "1080x1920"}
            </span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="text-slate-400">MAX 1MB</span>
          </div>
        </div>

        {/* Video Hints */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase tracking-widest bg-white/2 px-2.5 py-1 rounded-md border border-white/5">
            <span className="material-symbols-outlined text-[12px] text-violet-500/70">
              movie
            </span>
            <span>VIDEO:</span>
            <span className="text-slate-300">MP4 / H.264</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="text-slate-400">MAX 15MB</span>
          </div>
        </div>
      </motion.div>

      {/* Upload cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
        <motion.div
          animate={{ scale: state.imageFile ? 1 : 1 }}
          whileHover={{ y: -5 }}
          className="relative"
        >
          <UploadCard
            icon="image"
            title="Imagen de Seguimiento"
            formats="JPG, PNG, WEBP"
            accept="image/*,.jpg,.jpeg,.png,.webp"
            onFileSelect={handleImageSelect}
            disabled={state.uploading}
          />
          {state.imageFile && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-3 -right-3 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50 z-30"
            >
              <span className="material-symbols-outlined text-white text-sm">
                check
              </span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          animate={{ scale: state.videoFile ? 1 : 1 }}
          whileHover={{ y: -5 }}
          className="relative"
        >
          <UploadCard
            icon="movie"
            title="Video de Aumento"
            formats="MP4, MOV, WebM"
            accept="video/*,.mp4,.mov,.webm"
            onFileSelect={handleVideoSelect}
            disabled={state.uploading}
          />
          {state.videoFile && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-3 -right-3 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-600/50 z-30"
            >
              <span className="material-symbols-outlined text-white text-sm">
                check
              </span>
            </motion.div>
          )}
        </motion.div>
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
              <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">
                    image
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-slate-200">
                    {state.imageFile.name}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">
                    {(state.imageFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
            )}
            {state.videoFile && (
              <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-secondary">
                    movie
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-slate-200">
                    {state.videoFile.name}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">
                    {(state.videoFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-white/5" />

          {/* Public toggle */}
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

          <NeonButton
            fullWidth
            onClick={handleUpload}
            disabled={!state.imageFile || !state.videoFile || state.uploading}
            className="h-14 text-lg"
          >
            <span className="material-symbols-outlined">
              {state.uploading ? "sync" : "rocket_launch"}
            </span>
            {state.uploading
              ? `Subiendo ${state.progress}%`
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
              <CompletedItem
                key={project.id}
                filename={project.title}
                thumbnailUrl={project.image_url}
                meta={`${project.aspect_ratio} • ${project.is_public ? "🌐 Cloud" : "🔒 Private"} • ${new Date(project.created_at).toLocaleDateString()}`}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
