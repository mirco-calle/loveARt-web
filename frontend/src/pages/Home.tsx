import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../hooks/useAuthStore";
import { ROUTES } from "../routes/routes";
import NeonButton from "../components/ui/NeonButton";

// ─── Static data ──────────────────────────────────────────────────────────────
const ENGINES = [
  {
    id: "ar-photo",
    badge: "Spatial Engine v2.4",
    title: "AR Photo to Video",
    description:
      "Transforme imágenes estáticas en videos espaciales 3D inmersivos utilizando nuestra estimación de profundidad de IA patentada.",
    icon: "animation",
    bgIcon: "photo_camera",
    route: ROUTES.UPLOAD_TRACKING,
    accentColor: "#8b5cf6", // violet
    glowRgb: "139,92,246",
    buttonVariant: "primary" as const,
  },
  {
    id: "ar-blueprint",
    badge: "CAD Optimizer Pro",
    title: "AR Blueprint to 3D",
    description:
      "Convierta planos arquitectónicos 2D en modelos AR interactivos con iluminación basada en física.",
    icon: "view_in_ar",
    bgIcon: "architecture",
    route: ROUTES.UPLOAD_ARCHITECTURE,
    accentColor: "#06b6d4", // cyan
    glowRgb: "6,182,212",
    buttonVariant: "secondary" as const,
  },
] as const;

const RECENT_ITEMS = [
  { icon: "image", name: "Penthouse_View.ar", time: "Edited 2h ago" },
  { icon: "videocam", name: "Urban_Scan_04.mov", time: "Rendered 5h ago" },
  {
    icon: "model_training",
    name: "Floor_Plan_B.blueprint",
    time: "Uploaded 12h ago",
  },
] as const;

// ─── Engine card ──────────────────────────────────────────────────────────────
interface EngineCardProps {
  engine: (typeof ENGINES)[number];
  onLaunch: () => void;
}

function EngineCard({ engine, onLaunch }: EngineCardProps) {
  const {
    badge,
    title,
    description,
    icon,
    bgIcon,
    accentColor,
    glowRgb,
    buttonVariant,
  } = engine;

  return (
    <motion.div
      className="relative overflow-hidden backdrop-blur-xl bg-white/2 rounded-3xl md:rounded-4xl p-5 sm:p-6 lg:p-7 flex flex-col group min-h-[340px] md:h-[400px]"
      style={{
        border: `1px solid rgba(${glowRgb},0.3)`,
        boxShadow: `0 0 20px rgba(${glowRgb},0.08)`,
      }}
      whileHover={{
        scale: 1.01,
        boxShadow: `0 0 35px rgba(${glowRgb},0.25)`,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Decorative background icon */}
      <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-5 group-hover:opacity-15 transition-opacity duration-300 pointer-events-none select-none">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "clamp(80px, 12vw, 90px)", color: accentColor }}
        >
          {bgIcon}
        </span>
      </div>

      {/* Icon badge */}
      <div
        className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-5 shrink-0"
        style={{
          backgroundColor: `rgba(${glowRgb},0.12)`,
          border: `1px solid rgba(${glowRgb},0.3)`,
        }}
      >
        <span
          className="material-symbols-outlined text-xl md:text-2xl"
          style={{ color: accentColor }}
        >
          {icon}
        </span>
      </div>

      <div className="mt-auto relative z-10">
        {/* Badge */}
        <span
          className="inline-block px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-2 md:mb-3"
          style={{
            backgroundColor: `rgba(${glowRgb},0.1)`,
            color: accentColor,
            border: `1px solid rgba(${glowRgb},0.2)`,
          }}
        >
          {badge}
        </span>

        {/* Title */}
        <h2
          className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3"
          style={{ textShadow: `0 0 12px rgba(${glowRgb},0.45)` }}
        >
          {title}
        </h2>

        {/* Description */}
        <p className="text-slate-400 leading-relaxed mb-4 md:mb-6 max-w-sm text-xs sm:text-sm">
          {description}
        </p>

        {/* CTA */}
        <div className="flex">
          <NeonButton
            variant={buttonVariant}
            onClick={onLaunch}
            className="w-full sm:w-auto"
          >
            Launch Studio
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </NeonButton>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Recent activity item ─────────────────────────────────────────────────────
function RecentItem({
  icon,
  name,
  time,
}: {
  icon: string;
  name: string;
  time: string;
}) {
  return (
    <div className="backdrop-blur-xl bg-white/2 border border-white/10 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-white/5 cursor-pointer transition-colors">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-slate-500 text-xl sm:text-2xl">
          {icon}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-medium truncate">{name}</p>
        <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-tight">
          {time}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const displayName = user?.first_name || user?.username || "Creator";

  return (
    <div className="px-5 py-8 md:px-10 md:py-12 lg:px-12 max-w-7xl mx-auto overflow-x-hidden">
      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.05] -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <header className="mb-8 md:mb-12">
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 tracking-tight"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Bienvenido de nuevo,{" "}
          <span className="text-primary">{displayName}</span> 👋
        </motion.h1>
        <p className="text-slate-400 font-light text-sm sm:text-base max-w-2xl leading-relaxed">
          Selecciona un motor de alta fidelidad para comenzar tu siguiente obra
          maestra.
        </p>
      </header>

      {/* Engine cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
        {ENGINES.map((engine) => (
          <EngineCard
            key={engine.id}
            engine={engine}
            onLaunch={() => navigate(engine.route)}
          />
        ))}
      </section>

      {/* Recent Activity */}
      <section className="mb-10 lg:mb-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
            Actividad reciente
          </h2>
          <button
            onClick={() => navigate(ROUTES.LIBRARY)}
            className="text-[10px] md:text-xs text-primary font-bold hover:underline transition-opacity hover:opacity-80 uppercase tracking-wider"
          >
            Ver todos los activos
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RECENT_ITEMS.map((item) => (
            <RecentItem key={item.name} {...item} />
          ))}

          {/* New Project CTA */}
          <button
            onClick={() => navigate(ROUTES.LIBRARY)}
            className="backdrop-blur-xl bg-white/2 border border-dashed border-white/15 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 opacity-60 hover:opacity-100 cursor-pointer transition-all text-left"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-slate-400">
                add
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium">Nuevo Proyecto</p>
          </button>
        </div>
      </section>
    </div>
  );
}
