import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import AssetLibraryItem from "../components/ui/AssetLibraryItem";
import { getTrackingImages } from "../api/ImageTracking";
import { getBlueprints } from "../api/ArchitectureAr";
import type { TrackingImage } from "../api/ImageTracking";
import type { Blueprint } from "../api/ArchitectureAr";

type Tab = "tracking" | "architecture";

export default function MyLibraryPage() {
  const [tab, setTab] = useState<Tab>("tracking");
  const [trackingImages, setTrackingImages] = useState<TrackingImage[]>([]);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [trackingRes, archRes] = await Promise.all([
          getTrackingImages(),
          getBlueprints(),
        ]);
        // Handle both direct arrays and wrapped {results: []} responses
        const tData = Array.isArray(trackingRes.data)
          ? trackingRes.data
          : trackingRes.data.results;
        const aData = Array.isArray(archRes.data)
          ? archRes.data
          : archRes.data.results;

        setTrackingImages(tData || []);
        setBlueprints(aData || []);
      } catch {
        // Handled by axios interceptor
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const items = tab === "tracking" ? trackingImages : blueprints;

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
          Central de activos espaciales. Gestiona tus proyectos de seguimiento y
          arquitectura.
        </p>
      </motion.div>

      {/* Tabs Control */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-b border-white/5 pb-4">
        <div className="flex p-1 bg-white/5 rounded-2xl w-fit">
          <button
            onClick={() => setTab("tracking")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
              tab === "tracking"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-base">image</span>
            Image AR
          </button>
          <button
            onClick={() => setTab("architecture")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
              tab === "architecture"
                ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              view_in_ar
            </span>
            Arquitectura
          </button>
        </div>

        {/* Filter Indicator */}
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {items.length} Activos en{" "}
          {tab === "tracking" ? "Image Engine" : "Architecture Engine"}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5 flex flex-col justify-between border-white/10 hover:border-primary/30 transition-colors">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Total
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <p className="text-3xl md:text-4xl font-bold text-white tracking-tighter">
              {tab === "tracking" ? trackingImages.length : blueprints.length}
            </p>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex flex-col justify-between border-white/10 hover:border-primary/30 transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/70">
            Públicos
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <p className="text-3xl md:text-4xl font-bold text-white tracking-tighter">
              {items.filter((i) => i.is_public).length}
            </p>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex flex-col justify-between border-white/10 hover:border-primary/30 transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70">
            Privados
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <p className="text-3xl md:text-4xl font-bold text-white tracking-tighter">
              {items.filter((i) => !i.is_public).length}
            </p>
          </div>
        </GlassCard>
        <GlassCard className="p-5 hidden lg:flex flex-col justify-between border-white/10 bg-linear-to-br from-primary/10 to-transparent">
          <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">
            Estado Engine
          </span>
          <div className="mt-2">
            <p className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tighter">
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              Optimizado
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
      ) : items.length === 0 ? (
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
            Comienza a crear proyectos AR en los estudios de Image o
            Arquitectura.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((item) => {
            if (tab === "tracking") {
              const ti = item as TrackingImage;
              return (
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
                  onOptions={() => {}}
                />
              );
            } else {
              const bp = item as Blueprint;
              return (
                <AssetLibraryItem
                  key={bp.id}
                  type="architecture"
                  title={bp.title}
                  thumbnailUrl={bp.image_url}
                  fileSize={bp.file_size}
                  width={bp.width}
                  height={bp.height}
                  originalFormat={bp.original_format}
                  createdAt={bp.created_at}
                  isPublic={bp.is_public}
                  model3dSize={bp.model3d?.file_size}
                  onOptions={() => {}}
                />
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
