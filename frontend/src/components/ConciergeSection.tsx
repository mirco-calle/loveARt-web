import { motion } from "framer-motion";
import NeonButton from "./ui/NeonButton";
import GlassCard from "./ui/GlassCard";

const WHATSAPP_NUMBER = "59163136673";

export default function ConciergeSection() {
  const handleContact = () => {
    const message =
      "Hola! Vi el servicio LoveArt Concierge y me gustaría que ustedes editen mis videos de AR.";
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  return (
    <section className="py-24 px-5 sm:px-8 relative overflow-hidden bg-primary/5">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="text-center lg:text-left flex flex-col items-center lg:items-start"
        >
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary mb-4">
            Servicio Premium
          </h3>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-8 leading-tight">
            LoveArt <span className="text-secondary">Concierge</span>: <br />
            Nosotros lo hacemos por ti
          </h2>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            ¿No tienes tiempo para editar o no sabes cómo hacerlo? No te
            preocupes. Envíanos tus fotos y videos, y nuestro equipo de expertos
            creará la composición de AR perfecta para ti.
          </p>

          <ul className="space-y-4 mb-10">
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">
                magic_button
              </span>
              <span className="text-slate-200">
                Edición profesional de video incluida
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">
                bolt
              </span>
              <span className="text-slate-200">
                Entrega en menos de 24 horas
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">
                verified
              </span>
              <span className="text-slate-200">Garantía de "Efecto WOW"</span>
            </li>
          </ul>

          <NeonButton
            variant="secondary"
            className="h-16 px-10 text-lg w-full sm:w-auto"
            onClick={handleContact}
          >
            Solicitar Servicio de Edición
          </NeonButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <GlassCard className="p-1 border-secondary/20 overflow-hidden rounded-[40px] rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-linear-to-tr from-secondary/20 to-transparent" />
              <span className="material-symbols-outlined text-7xl text-secondary animate-pulse">
                movie_edit
              </span>
            </div>
          </GlassCard>
          <div className="absolute -bottom-6 -left-6 bg-background-dark border border-white/10 p-6 rounded-3xl shadow-2xl z-20 hidden sm:block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <p className="text-sm font-bold">"Ahorré horas de trabajo"</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                  Inmobiliaria Santa Cruz
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
