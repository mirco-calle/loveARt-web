import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

/**
 * Reusable glass-effect card with optional hover animation.
 * Consistent with the neon-cyan design system.
 */
export default function GlassCard({
  children,
  className = "",
  hover = false,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      className={`bg-card-dark border border-white/5 rounded-2xl ${className}`}
      whileHover={
        hover ? { scale: 1.02, borderColor: "rgba(0,242,255,0.2)" } : undefined
      }
      whileTap={onClick ? { scale: 0.97 } : undefined}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </motion.div>
  );
}
