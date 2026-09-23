import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import GlassCard from "../components/ui/GlassCard";
import AssetLibraryItem from "../components/ui/AssetLibraryItem";
import ModalConfirm from "../components/common/ModalConfirm";
import { getTrackingImages, deleteTrackingImage } from "../api/ImageTracking";
import type { TrackingImage } from "../api/ImageTracking";

export default function MyLibraryPage() {
  const [trackingImages, setTrackingImages] = useState<TrackingImage[]>([]);
  const [loading, setLoading] = useState(true);

  // States for deletion modal
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const trackingRes = await getTrackingImages();
      const tData = Array.isArray(trackingRes.data)
        ? trackingRes.data
        : trackingRes.data.results;

      setTrackingImages(tData || []);
    } catch {
      // Handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      await deleteTrackingImage(itemToDelete.id);
      setTrackingImages((prev) =>
        prev.filter((i) => i.id !== itemToDelete.id),
      );
      toast.success("Proyecto eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar el proyecto");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="px-5 sm:px-8 md:px-10 py-8 pb-32 lg:pb-12 flex flex-col gap-8 md:gap-10 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Mi Biblioteca AR
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl leading-relaxed">
          Central de activos de Realidad Aumentada. Gestiona tus proyectos de imagen objetivo y video.
        </p>
      </motion.div>

      {/* Filter / Status Bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs sm:text-sm font-bold">
          <span className="material-symbols-outlined text-base">image</span>
          Image AR Tracking
        </div>

        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {trackingImages.length} Activos registrados
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 md:p-5 flex flex-col justify-between border-white/10 hover:border-primary/30 transition-colors">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Total Proyectos
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <p className="text-3xl md:text-4xl font-bold text-white tracking-tighter">
              {trackingImages.length}
            </p>
          </div>
        </GlassCard>
        <GlassCard className="p-4 md:p-5 flex flex-col justify-between border-white/10 hover:border-primary/30 transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/70">
            Públicos
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <p className="text-3xl md:text-4xl font-bold text-white tracking-tighter">
              {trackingImages.filter((i) => i.is_public).length}
            </p>
          </div>
        </GlassCard>
        <GlassCard className="p-4 md:p-5 flex flex-col justify-between border-white/10 hover:border-primary/30 transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70">
            Privados
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <p className="text-3xl md:text-4xl font-bold text-white tracking-tighter">
              {trackingImages.filter((i) => !i.is_public).length}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Content grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">
            sync
          </span>
          <p className="text-xs font-bold uppercase tracking-widest text-primary animate-pulse">
            Accediendo al Studio...
          </p>
        </div>
      ) : trackingImages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24 border border-dashed border-white/10 rounded-[40px] bg-white/2"
        >
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-slate-600">
              grid_view
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
            Tu biblioteca está vacía
          </h3>
          <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
            Comienza creando proyectos de AR Imagen a Video en el Studio.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {trackingImages.map((ti) => (
            <AssetLibraryItem
              key={ti.id}
              type="tracking"
              title={ti.title}
              thumbnailUrl={ti.image_url}
              aspectRatio={ti.aspect_ratio}
              fileSize={ti.file_size}
              width={ti.width}
              height={ti.height}
              createdAt={ti.created_at}
              isPublic={ti.is_public}
              videoSize={ti.video?.file_size}
              onDelete={() =>
                setItemToDelete({
                  id: ti.id,
                  title: ti.title,
                })
              }
            />
          ))}
        </div>
      )}

      {/* Popups & Modals */}
      <ModalConfirm
        isOpen={!!itemToDelete}
        onCancel={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar Proyecto?"
        description={`Estás a punto de eliminar "${itemToDelete?.title}". Esta acción borrará también el video asociado y no se puede deshacer.`}
        confirmLabel="Eliminar para siempre"
        isLoading={isDeleting}
        variant="danger"
        icon="delete_forever"
      />
    </div>
  );
}
