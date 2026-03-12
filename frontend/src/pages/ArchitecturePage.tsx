import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import UploadCard from "../components/ui/UploadCard";
import ProgressBar from "../components/ui/ProgressBar";
import CompletedItem from "../components/ui/CompletedItem";
import ToggleSwitch from "../components/ui/ToggleSwitch";
import NeonButton from "../components/ui/NeonButton";
import {
  createBlueprint,
  uploadModel3D,
  getBlueprints,
  Blueprint,
} from "../api/ArchitectureAr";

interface UploadState {
  title: string;
  blueprintFile: File | null;
  model3dFile: File | null;
  isPublic: boolean;
  blueprintPreview: string | null;
  uploading: boolean;
  progress: number;
}

export default function ArchitecturePage() {
  const [state, setState] = useState<UploadState>({
    title: "",
    blueprintFile: null,
    model3dFile: null,
    isPublic: false,
    blueprintPreview: null,
    uploading: false,
    progress: 0,
  });
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);

  // Fetch blueprints on load
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await getBlueprints();
        setBlueprints(Array.isArray(data) ? data : (data as any).results || []);
      } catch (error) {
        console.error("Error fetching blueprints:", error);
      }
    };
    fetchProjects();
  }, []);

  const handleBlueprintSelect = useCallback((file: File) => {
    // Preview only for images, not PDF (PDF preview in browser requires different handling)
    const isImage = file.type.startsWith("image/");
    const preview = isImage ? URL.createObjectURL(file) : null;

    setState((prev) => ({
      ...prev,
      blueprintFile: file,
      blueprintPreview: preview,
      title: prev.title || file.name.split(".")[0],
    }));
    toast.success(`Plano seleccionado: ${file.name}`);
  }, []);

  const handleModel3DSelect = useCallback((file: File) => {
    setState((prev) => ({ ...prev, model3dFile: file }));
    toast.success(`Modelo 3D seleccionado: ${file.name}`);
  }, []);

  const handleUpload = async () => {
    if (!state.blueprintFile || !state.model3dFile) {
      toast.error("Selecciona un plano y un modelo 3D");
      return;
    }

    setState((prev) => ({ ...prev, uploading: true, progress: 0 }));

    try {
      // Step 1: Create Blueprint
      const blueprintData = new FormData();
      blueprintData.append("image", state.blueprintFile);
      blueprintData.append("title", state.title || state.blueprintFile.name);
      blueprintData.append("is_public", String(state.isPublic));

      setState((prev) => ({ ...prev, progress: 30 }));
      const { data: blueprintResult } = await createBlueprint(blueprintData);

      // Step 2: Upload 3D Model
      const modelData = new FormData();
      modelData.append("file", state.model3dFile);
      modelData.append("title", state.model3dFile.name);

      setState((prev) => ({ ...prev, progress: 70 }));
      await uploadModel3D(blueprintResult.id, modelData);

      setState((prev) => ({ ...prev, progress: 100 }));

      // Refresh list
      const { data } = await getBlueprints();
      setBlueprints(Array.isArray(data) ? data : (data as any).results || []);

      toast.success("¡Proyecto de arquitectura AR subido!");

      // Reset form
      setTimeout(() => {
        setState({
          title: "",
          blueprintFile: null,
          model3dFile: null,
          isPublic: false,
          blueprintPreview: null,
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
          CAD Optimizer Studio
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl leading-relaxed">
          Convierte planos arquitectónicos 2D en experiencias AR inmersivas.
          Sube tu plano y el modelo 3D correspondiente.
        </p>
      </motion.div>

      {/* Project Name Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block ml-1">
          Nombre de la Obra / Proyecto
        </label>
        <input
          type="text"
          value={state.title}
          onChange={(e) =>
            setState((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Ej: Edificio Los Pinos - Planta Baja"
          className="w-full bg-white/2 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
        />
      </motion.div>

      {/* Production Hints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
      >
        {/* Blueprint Hints */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase tracking-widest bg-white/2 px-2.5 py-1 rounded-md border border-white/5">
            <span className="material-symbols-outlined text-[12px] text-cyan-500/70">
              description
            </span>
            <span>PLANO:</span>
            <span className="text-slate-300">PDF / JPG / PNG</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="text-slate-400">OPTIMIZADO</span>
          </div>
        </div>

        {/* 3D Hints */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase tracking-widest bg-white/2 px-2.5 py-1 rounded-md border border-white/5">
            <span className="material-symbols-outlined text-[12px] text-violet-500/70">
              deployed_code
            </span>
            <span>Assets 3D:</span>
            <span className="text-slate-300">FBX / OBJ / GLB</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="text-slate-400">CONVERSION GLB</span>
          </div>
        </div>
      </motion.div>

      {/* Upload cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
        <UploadCard
          icon="description"
          title="Plano Técnico"
          formats="JPG, PNG, WebP, PDF"
          accept="image/*,.jpg,.jpeg,.png,.webp,.pdf"
          onFileSelect={handleBlueprintSelect}
          disabled={state.uploading}
          previewUrl={state.blueprintPreview}
        />
        <UploadCard
          icon="deployed_code"
          title="Assets 3D"
          formats="FBX, OBJ, GLB, GLTF"
          accept=".fbx,.obj,.glb,.gltf"
          onFileSelect={handleModel3DSelect}
          disabled={state.uploading}
        />
      </div>

      {/* Preview + settings */}
      {(state.blueprintFile || state.model3dFile) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/2 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Pipeline de Renderizado
            </h3>
            {state.blueprintPreview && (
              <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10">
                <img
                  src={state.blueprintPreview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.blueprintFile && (
              <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">
                    description
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-slate-200">
                    {state.blueprintFile.name}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">
                    {(state.blueprintFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
            )}
            {state.model3dFile && (
              <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-secondary">
                    deployed_code
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-slate-200">
                    {state.model3dFile.name}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">
                    {(state.model3dFile.size / 1024 / 1024).toFixed(1)} MB
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
              label="Acceso Público"
              description="Habilitar visualización para colaboradores y clientes externos."
            />
          </div>

          <NeonButton
            fullWidth
            onClick={handleUpload}
            disabled={
              !state.blueprintFile || !state.model3dFile || state.uploading
            }
            className="h-14 text-lg"
          >
            <span className="material-symbols-outlined">
              {state.uploading ? "data_thresholding" : "layers"}
            </span>
            {state.uploading
              ? `Procesando... ${state.progress}%`
              : "Compilar Studio AR"}
          </NeonButton>
        </motion.div>
      )}

      {/* Active uploads */}
      {state.uploading && (
        <section className="flex flex-col gap-4 bg-primary/5 p-6 rounded-3xl border border-primary/20">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/70 font-mono">
              ENGINE_LOG :: VIRTUAL_PIPELINE
            </h3>
            <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-full border border-primary/30 animate-pulse font-bold tracking-tighter">
              ACTIVE
            </span>
          </div>
          <ProgressBar
            filename={state.blueprintFile?.name || "blueprint.cad"}
            progress={state.progress}
            icon="view_in_ar"
          />
        </section>
      )}

      {/* List of User's Projects */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
            Biblioteca de Arquitectura ({blueprints.length})
          </h3>
          <div className="h-px bg-white/5 w-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {blueprints.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl opacity-40">
              <span className="material-symbols-outlined text-4xl mb-2">
                folder_off
              </span>
              <p className="text-sm italic">
                No hay proyectos de arquitectura en tu biblioteca todavía.
              </p>
            </div>
          ) : (
            blueprints.map((project) => (
              <CompletedItem
                key={project.id}
                filename={project.title}
                thumbnailUrl={project.image_url}
                meta={`Compilado • ${project.is_public ? "🌐 Cloud" : "🔒 Private"} • ${new Date(project.created_at).toLocaleDateString()}`}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
