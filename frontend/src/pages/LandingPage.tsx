import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES } from "../routes/routes";
import NeonButton from "../components/ui/NeonButton";
import logo from "../assets/logo.png";
import CoreAPI, { AppBuild } from "../api/Core";

const FEATURES = [
  {
    icon: "photo_camera",
    title: "Image AR",
    description:
      "Sube una foto y un video. Al escanear la foto, tu video cobra vida.",
  },
  {
    icon: "view_in_ar",
    title: "Architecture AR",
    description:
      "Sube un plano y un modelo 3D. Visualiza edificios en realidad aumentada.",
  },
  {
    icon: "public",
    title: "Catálogo Público",
    description:
      "Comparte tus proyectos con el mundo o mantén tu trabajo privado.",
  },
];

const STEPS = [
  { number: "01", title: "Sube tu contenido", detail: "Desde el portal web" },
  { number: "02", title: "Descarga la app", detail: "Disponible para Android" },
  { number: "03", title: "Escanea y disfruta", detail: "AR instantáneo" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
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
      <header className="fixed top-0 w-full z-50 glass-header shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-16 sm:h-20">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center glow-primary bg-primary/20">
              <img src={logo} alt="LoveArt" className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tighter">
              LoveArt
            </h1>
          </div>
          <Link to={ROUTES.LOGIN}>
            <NeonButton
              variant="primary"
              className="h-10 sm:h-12 text-xs sm:text-sm px-5 sm:px-8"
            >
              <span className="material-symbols-outlined text-base">login</span>
              Portal
            </NeonButton>
          </Link>
        </div>
      </header>

      {/* ──── HERO ──── */}
      <section className="relative pt-36 pb-20 sm:pt-48 sm:pb-32 px-5 sm:px-8 text-center hero-gradient">
        <div className="grid-bg absolute inset-0 pointer-events-none opacity-[0.15]" />

        {/* Floating Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-[100px] pointer-events-none -z-10" />

        <motion.div
          className="relative max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
        >
          <motion.span
            variants={fadeUp}
            custom={0}
            className="inline-block px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] bg-primary/10 text-primary rounded-full border border-primary/20 mb-8"
          >
            ✨ Realidad Aumentada de Alta Fidelidad
          </motion.span>

          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] sm:leading-[0.85] mb-8"
          >
            DALE <span className="text-primary glow-text">VIDA</span> A TU{" "}
            <br className="hidden sm:block" />
            <span className="text-linear-to-r from-secondary to-primary bg-clip-text text-transparent">
              IMAGINACIÓN
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-8 text-slate-400 text-base sm:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed"
          >
            Plataforma Studio para crear experiencias AR instantáneas. Sube
            fotos, videos y modelos 3D en segundos.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-12 px-4 sm:px-0"
          >
            <NeonButton
              variant="secondary"
              className="h-14 sm:h-16 text-lg px-8 flex-1 sm:flex-none"
              onClick={handleDownload}
            >
              <span className="material-symbols-outlined">download</span>
              Descargar APK {latestBuild ? `v${latestBuild.version}` : ""}
            </NeonButton>
            <Link to={ROUTES.LOGIN} className="flex-1 sm:flex-none">
              <NeonButton
                variant="primary"
                className="h-14 sm:h-16 text-lg px-10 w-full"
              >
                <span className="material-symbols-outlined">rocket_launch</span>
                Ir al Portal
              </NeonButton>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ──── FEATURES ──── */}
      <section className="py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center mb-16 text-center">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">
              CORE ENGINES
            </h3>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Capacidades del Studio
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="bg-white/2 border border-white/5 rounded-[40px] p-8 sm:p-10 group hover:border-primary/30 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">
                    {feat.icon}
                  </span>
                </div>
                <h4 className="text-2xl font-bold mb-4 tracking-tight">
                  {feat.title}
                </h4>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── HOW IT WORKS ──── */}
      <section className="py-24 px-5 sm:px-8 bg-surface-dark/30 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary mb-4">
              FLUJO DE TRABAJO
            </h3>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              De 2D a AR en 3 Pasos
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8 lg:gap-16">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-6">
                  <span className="text-7xl lg:text-8xl font-black text-white/5 group-hover:text-primary/10 transition-colors">
                    {step.number}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 h-12 bg-linear-to-b from-primary to-transparent rounded-full opacity-40" />
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-2 tracking-tight">
                  {step.title}
                </h4>
                <p className="text-sm sm:text-base text-slate-500 max-w-[200px]">
                  {step.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── CTA ──── */}
      <section className="py-32 px-5 sm:px-8 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] -z-10" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="max-w-2xl mx-auto bg-white/2 border border-white/10 rounded-[48px] p-10 sm:p-20 backdrop-blur-xl shadow-2xl"
        >
          <h3 className="text-3xl sm:text-5xl font-black mb-6 tracking-tighter">
            ¿LISTO PARA EL FUTURO?
          </h3>
          <p className="text-slate-400 text-sm sm:text-lg mb-12 max-w-md mx-auto leading-relaxed">
            Crea tu cuenta gratis hoy mismo y comienza a construir tu propio
            metaverso LoveArt.
          </p>
          <Link to={ROUTES.LOGIN}>
            <NeonButton
              fullWidth
              className="h-16 text-lg sm:text-xl rounded-2xl"
            >
              Empezar ahora gratis
            </NeonButton>
          </Link>
        </motion.div>
      </section>

      {/* ──── FOOTER ──── */}
      <footer className="border-t border-white/5 py-12 px-5 sm:px-8 bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center glow-primary bg-primary/20">
              <img src={logo} alt="LoveArt" className="w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">
              LoveArt
            </span>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-bold uppercase tracking-widest text-slate-500">
            <Link to="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="#" className="hover:text-primary transition-colors">
              Documentation
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="hover:text-primary transition-colors"
            >
              Portal Login
            </Link>
          </nav>

          <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-medium text-center">
            © {new Date().getFullYear()} LoveArt AR Studio. Powered by Spatial
            Engine v2.4
          </p>
        </div>
      </footer>
    </div>
  );
}
