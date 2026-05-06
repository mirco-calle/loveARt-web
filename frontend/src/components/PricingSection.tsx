import { motion } from "framer-motion";
import NeonButton from "./ui/NeonButton";
import GlassCard from "./ui/GlassCard";

interface PlanProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
  waMessage: string;
}

const WHATSAPP_NUMBER = "59163136673"; // Mirco: Cambia esto por tu número real

const PricingCard = ({
  name,
  price,
  description,
  features,
  isFeatured,
  waMessage,
}: PlanProps) => {
  const handleContact = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;
    window.open(url, "_blank");
  };

  return (
    <GlassCard
      className={`relative p-8 flex flex-col h-full border-t-4 ${
        isFeatured
          ? "border-primary glow-primary scale-105 z-10"
          : "border-white/10"
      }`}
    >
      {isFeatured && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-black uppercase px-3 py-1 rounded-full">
          Más Popular
        </span>
      )}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black">{price}</span>
          <span className="text-slate-400 text-sm">/mes</span>
        </div>
        <p className="text-slate-400 text-sm mt-4 leading-relaxed">
          {description}
        </p>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <span className="material-symbols-outlined text-primary text-lg">
              check_circle
            </span>
            <span className="text-slate-300">{feature}</span>
          </li>
        ))}
      </ul>

      <NeonButton
        variant={isFeatured ? "primary" : "secondary"}
        fullWidth
        onClick={handleContact}
        className="h-14"
      >
        {name === "Explorer" ? "Empezar Gratis" : "Adquirir vía WhatsApp"}
      </NeonButton>
    </GlassCard>
  );
};

export default function PricingSection() {
  const plans = [
    {
      name: "Explorer",
      price: "Bs 0",
      description:
        "Ideal para freelancers y creadores que quieren probar la potencia de la AR.",
      features: [
        "15 Activaciones Vision Engine / mes",
        "1 Usuario",
        "Soporte por Documentación",
        "Marca de Agua LoveArt",
        "Catálogo Público",
      ],
      waMessage: "Hola Mirco! Me gustaría probar el plan Explorer de LoveArt.",
    },
    {
      name: "Studio",
      price: "Bs 199",
      description:
        "Perfecto para estudios de arquitectura y marketing que necesitan recurrencia.",
      features: [
        "Vision Engine Ilimitado",
        "5 Proyectos BluePrint 3D activos",
        "Hasta 5 Usuarios",
        "Sin marca de agua",
        "Soporte por Email (48h)",
      ],
      isFeatured: true,
      waMessage: "Hola Mirco! Me interesa el plan Studio para mi empresa.",
    },
    {
      name: "Platform",
      price: "Bs 599",
      description:
        "Solución Enterprise para grandes desarrolladoras e instituciones.",
      features: [
        "Todo lo de Studio Ilimitado",
        "White-label (Tu marca)",
        "API REST de integración",
        "Onboarding guiado",
        "Soporte Dedicado (<4h)",
      ],
      waMessage:
        "Hola Mirco! Necesito información sobre el plan Platform para un proyecto grande.",
    },
  ];

  return (
    <section
      id="pricing"
      className="py-32 px-5 sm:px-8 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">
            Planes y Precios
          </h3>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter">
            Escale su <span className="text-primary">Visión</span>
          </h2>
          <p className="text-slate-400 mt-6 max-w-2xl mx-auto text-lg">
            Elija el plan que mejor se adapte a su volumen de proyectos. Todos
            los pagos se gestionan de forma personalizada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <PricingCard {...plan} />
            </motion.div>
          ))}
        </div>

        {/* Yearly discount info */}
        <div className="mt-16 text-center">
          <div className="inline-block p-4 rounded-3xl bg-primary/5 border border-primary/20 backdrop-blur-md">
            <p className="text-sm font-bold">
              💰 <span className="text-primary">Ahorra un 20%</span> pagando
              anualmente. Consulta por WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
