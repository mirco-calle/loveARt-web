import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES } from "../routes/routes";
import NeonButton from "../components/ui/NeonButton";
import GlassCard from "../components/ui/GlassCard";
import PricingSection from "../components/PricingSection";
import ConciergeSection from "../components/ConciergeSection";
import logo from "../assets/logo.png";
import heroAr from "../assets/hero_ar.png";
import CoreAPI, { AppBuild } from "../api/Core";

const ENGINES = [
  {
    icon: "photo_camera",
    title: "Vision Engine",
    subtitle: "Imagen a Video",
    description:
      "Transforma fotografías en experiencias cinematográficas. El contenido cobra vida al ser escaneado con la App.",
    color: "primary",
  },
  {
    icon: "architecture",
    title: "BluePrint 3D",
    subtitle: "Plano a Volumen",
    description:
      "Eleva planos 2D a maquetas 3D interactivas. Ideal para preventa inmobiliaria y visualización de espacios.",
    color: "secondary",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: "easeOut" as const },
  }),
};

export default function LandingPage() {
  const [latestBuild, setLatestBuild] = useState<AppBuild | null>(null);

  useEffect(() => {
    const fetchBuild = async () => {
      try {
        const build = await CoreAPI.getLatestBuild();
        setLatestBuild(build);
      } catch (error) {
        console.error("Error fetching latest build:", error);
      }
    };
    fetchBuild();
  }, []);

  const handleDownload = () => {
    if (latestBuild?.apk_file) {
      window.open(latestBuild.apk_file, "_blank");
    } else {
      alert("La aplicación no está disponible temporalmente.");
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-white font-display overflow-x-hidden">
      {/* ──── HEADER ──── */}
      <header className="fixed top-0 w-full z-50 glass-header border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-8 h-16 sm:h-20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center glow-primary bg-primary/20">
              <img src={logo} alt="LoveArt" className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase">
              LoveArt
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-400 mr-8">
              <a
                href="#solutions"
                className="hover:text-white transition-colors"
              >
                Soluciones
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">
                Precios
              </a>
              <a
                href="#concierge"
                className="hover:text-white transition-colors"
              >
                Concierge
              </a>
            </nav>
            <Link to={ROUTES.LOGIN}>
              <NeonButton
                variant="primary"
                className="h-10 sm:h-11 px-6 text-xs uppercase tracking-widest font-black"
              >
                Acceder al Portal
              </NeonButton>
            </Link>
          </div>
        </div>
      </header>

      {/* ──── HERO ──── */}
      <section className="relative pt-5 pb-5 sm:pt-32 sm:pb-24 px-6 sm:px-8">
        <div className="grid-bg absolute inset-0 pointer-events-none opacity-[0.2]" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative">
          <motion.div initial="hidden" animate="visible">
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-block px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] bg-primary/10 text-primary rounded-full border border-primary/20 mb-8"
            >
              🚀 Realidad Aumentada de Próxima Generación
            </motion.span>

            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] mb-8"
            >
              VENDE LO <br />
              <span className="text-primary glow-text">INIMAGINABLE</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-slate-400 text-lg sm:text-xl max-w-xl mb-12 leading-relaxed"
            >
              La plataforma Studio definitiva para arquitectos y
              desarrolladores. Transforme planos en maquetas 3D y fotos en
              videos vivos en segundos.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap gap-4"
            >
              <NeonButton
                variant="secondary"
                className="h-16 px-10 text-lg"
                onClick={handleDownload}
              >
                <span className="material-symbols-outlined mr-2">download</span>
                Descargar App
              </NeonButton>
              <Link to={ROUTES.LOGIN}>
                <NeonButton variant="primary" className="h-16 px-10 text-lg">
                  Empieza Gratis
                </NeonButton>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full -z-10" />
            <GlassCard className="p-2 border-white/10 overflow-hidden rounded-[48px] shadow-2xl rotate-2">
              <img
                src={heroAr}
                alt="AR Experience"
                className="w-full h-auto rounded-[40px]"
              />
            </GlassCard>

            {/* Floating stats card */}
            <div className="absolute -bottom-10 -right-10 bg-background-dark/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl z-20">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl font-black text-primary">+250%</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                  En cierre <br /> de ventas
                </span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  transition={{ delay: 1, duration: 1.5 }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── SOLUTIONS (ENGINES) ──── */}
      <section
        id="solutions"
        className="py-32 px-6 sm:px-8 border-y border-white/5 bg-surface-dark/20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary mb-4">
              Core Technology
            </h3>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter">
              Motores de Inmersión
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ENGINES.map((engine, i) => (
              <motion.div
                key={engine.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
              >
                <GlassCard
                  className={`p-10 group hover:border-${engine.color}/30 transition-all duration-500`}
                >
                  <div
                    className={`h-16 w-16 bg-${engine.color}/10 rounded-2xl flex items-center justify-center text-${engine.color} border border-${engine.color}/20 mb-8 group-hover:scale-110 transition-transform`}
                  >
                    <span className="material-symbols-outlined text-4xl">
                      {engine.icon}
                    </span>
                  </div>
                  <div className="mb-4">
                    <span
                      className={`text-[10px] font-black uppercase tracking-[0.2em] text-${engine.color}`}
                    >
                      {engine.subtitle}
                    </span>
                    <h4 className="text-3xl font-bold tracking-tight mt-1">
                      {engine.title}
                    </h4>
                  </div>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    {engine.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── CONCIERGE ──── */}
      <div id="concierge">
        <ConciergeSection />
      </div>

      {/* ──── PRICING ──── */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* ──── FINAL CTA ──── */}
      <section className="py-40 px-6 sm:px-8 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-secondary/5 blur-[120px] -z-10" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-5xl sm:text-7xl font-black mb-10 tracking-tighter">
            LLEVE SU NEGOCIO AL <br />
            <span className="text-secondary glow-text">SIGUIENTE NIVEL</span>
          </h2>
          <p className="text-slate-400 text-lg sm:text-xl mb-12 max-w-2xl mx-auto">
            Únase a los líderes que ya están transformando la forma en que el
            mundo ve lo que todavía no existe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ROUTES.LOGIN}>
              <NeonButton
                variant="primary"
                className="h-16 px-12 text-xl rounded-2xl w-full sm:w-auto"
              >
                Empezar Ahora Gratis
              </NeonButton>
            </Link>
            <NeonButton
              variant="secondary"
              className="h-16 px-12 text-xl rounded-2xl w-full sm:w-auto"
              onClick={() => window.open(`https://wa.me/59170000000`, "_blank")}
            >
              Hablar con Ventas
            </NeonButton>
          </div>
        </motion.div>
      </section>

      {/* ──── FOOTER ──── */}
      <footer className="border-t border-white/5 py-16 px-6 sm:px-8 bg-background-dark">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center glow-primary bg-primary/20">
                <img src={logo} alt="LoveArt" className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">
                LoveArt
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
              Plataforma Studio líder en Realidad Aumentada para Arquitectura y
              Marketing.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Link to="#" className="hover:text-primary">
              Privacidad
            </Link>
            <Link to="#" className="hover:text-primary">
              Términos
            </Link>
            <Link to="#" className="hover:text-primary">
              Wiki
            </Link>
            <Link to={ROUTES.LOGIN} className="hover:text-primary">
              Portal
            </Link>
          </nav>

          <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-medium">
            © {new Date().getFullYear()} LoveArt Studio. By MircoDev.
          </p>
        </div>
      </footer>
    </div>
  );
}
