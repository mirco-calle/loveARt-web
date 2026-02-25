import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import UploadCard from "../components/ui/UploadCard";
import ProgressBar from "../components/ui/ProgressBar";
import CompletedItem from "../components/ui/CompletedItem";
import ToggleSwitch from "../components/ui/ToggleSwitch";
import NeonButton from "../components/ui/NeonButton";
import { createBlueprint, uploadModel3D } from "../api/ArchitectureAr";

interface UploadState {
  blueprintFile: File | null;
  model3dFile: File | null;
  isPublic: boolean;
  uploading: boolean;
  progress: number;
}

export default function ArchitecturePage() {
  const [state, setState] = useState<UploadState>({
    blueprintFile: null,
    model3dFile: null,
    isPublic: false,
    uploading: false,
    progress: 0,
  });
  const [completedUploads, setCompletedUploads] = useState<
    { name: string; time: string }[]
  >([]);

  const handleBlueprintSelect = useCallback((file: File) => {
    setState((prev) => ({ ...prev, blueprintFile: file }));
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
      const blueprintData = new FormData();
      blueprintData.append("image", state.blueprintFile);
      blueprintData.append("title", state.blueprintFile.name);
      blueprintData.append("is_public", String(state.isPublic));

      setState((prev) => ({ ...prev, progress: 30 }));
      const { data: blueprintResult } = await createBlueprint(blueprintData);

      const modelData = new FormData();
      modelData.append("file", state.model3dFile);
      modelData.append("title", state.model3dFile.name);

      setState((prev) => ({ ...prev, progress: 70 }));
      await uploadModel3D(blueprintResult.id, modelData);

      setState((prev) => ({ ...prev, progress: 100 }));

      setCompletedUploads((prev) => [
        {
          name: `${state.blueprintFile!.name} + ${state.model3dFile!.name}`,
          time: "Ahora",
        },
        ...prev,
      ]);

      toast.success("¡Proyecto de arquitectura AR subido!");

      setTimeout(() => {
        setState({
          blueprintFile: null,
          model3dFile: null,
          isPublic: false,
          uploading: false,
          progress: 0,
        });
      }, 1000);
    } catch {
      toast.error("Error al subir. Intenta de nuevo.");
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

      {/* Upload cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <UploadCard
          icon="description"
          title="Plano Técnico"
          formats="JPG, PNG, WebP, PDF"
          accept="image/*,.jpg,.jpeg,.png,.webp,.pdf"
          onFileSelect={handleBlueprintSelect}
          disabled={state.uploading}
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
          className="bg-white/2 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl shadow-primary/5"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Pipeline de Renderizado
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.blueprintFile && (
              <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 text-primary">
                  <span className="material-symbols-outlined">description</span>
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
                <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0 text-secondary">
                  <span className="material-symbols-outlined">
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

      {/* Completed */}
      {completedUploads.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
              Biblioteca de Planos ({completedUploads.length})
            </h3>
            <div className="h-px bg-white/5 w-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {completedUploads.map((item, i) => (
              <CompletedItem
                key={i}
                filename={item.name}
                meta={`Compilado • ${item.time}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
