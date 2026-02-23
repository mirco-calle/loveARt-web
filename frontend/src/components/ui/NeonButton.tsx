import { motion } from "framer-motion";

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

/**
 * Primary CTA button with neon glow.
 * Supports primary (filled), secondary (outline), and ghost variants.
 */
export default function NeonButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  fullWidth = false,
  className = "",
}: NeonButtonProps) {
  const base = `inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
    fullWidth ? "w-full" : ""
  }`;

  const variants = {
    primary:
      "bg-primary text-white glow-primary hover:glow-primary-strong hover:brightness-110 border-none",
    secondary:
      "bg-secondary/10 text-secondary border border-secondary/50 hover:bg-secondary/20 hover:glow-secondary",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}
