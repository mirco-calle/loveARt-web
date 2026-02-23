import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ROUTES } from "../../routes/routes";
import { useAuthStore } from "../../hooks/useAuthStore";
import { slideTrans, slideVariants, Spinner } from "../../pages/LoginPage";
import logo from "../../assets/logo.png";

// ─── Props ────────────────────────────────────────────────────────────────────
interface LoginFormProps {
  /** Navigate back to the selector view */
  onBack: () => void;
  /** Navigate directly to the register form */
  onGoRegister: () => void;
  /** Called when the backend says the account exists but email is not verified */
  onNeedsVerify: (email: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginForm({
  onBack,
  onGoRegister,
  onNeedsVerify,
}: LoginFormProps) {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.identifier, form.password);
      toast.success("¡Bienvenido!");
      navigate(ROUTES.HOME);
    } catch (err: unknown) {
      const typedErr = err as Error & { code?: string; email?: string };
      if (typedErr?.code === "UNVERIFIED") {
        // Account exists but email not verified — redirect to OTP screen
        toast.info("Verifica tu email para continuar.");
        // Use the real email from the backend (works even when user typed a username)
        onNeedsVerify(typedErr.email || form.identifier);
        return;
      }
      toast.error(
        "Credenciales inválidas. Verifica tu email/usuario y contraseña.",
      );
    }
  };

  return (
    <motion.div
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={slideTrans}
      className="flex-1 flex flex-col px-8 py-10 sm:px-12 sm:py-12"
    >
      <BackButton onClick={onBack} />

      <div className="flex flex-col items-center mb-8 sm:mb-10 text-center">
        <AuthIcon />
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-6 text-violet-400">
          Hola de nuevo
        </h2>
        <p className="text-[12px] uppercase tracking-[0.4em] mt-2 font-bold text-slate-500">
          Explora el futuro hoy
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-8">
        <div className="space-y-6">
          <UnderlineField
            label="Identificador"
            name="identifier"
            type="text"
            placeholder="Email o usuario"
            value={form.identifier}
            onChange={handleChange}
            autoComplete="username"
            required
            rightSlot={
              <span className="material-symbols-outlined text-slate-600">
                person
              </span>
            }
          />

          <UnderlineField
            label="Contraseña"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
            labelRight={
              <button
                type="button"
                className="text-[10px] font-bold uppercase tracking-wider text-secondary hover:text-white transition-colors"
                onClick={() => toast.info("Funcionalidad en desarrollo")}
              >
                ¿Olvidaste tu contraseña?
              </button>
            }
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-600 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            }
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 sm:h-16 rounded-[20px] bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_0_25px_rgba(139,92,246,0.3)] flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <span className="material-symbols-outlined">login</span>
          )}
          <span>Iniciar Sesión</span>
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-slate-500">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={onGoRegister}
              className="text-secondary font-bold hover:underline underline-offset-4"
            >
              Regístrate gratis
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Small reusable atoms ─────────────────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-sm mb-6 sm:mb-8 transition-opacity hover:opacity-70 self-start shrink-0"
      style={{ color: "rgba(148,163,184,0.7)" }}
      aria-label="Back"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      Back
    </button>
  );
}

function AuthIcon() {
  return (
    <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: "rgba(139,92,246,0.2)", filter: "blur(20px)" }}
        aria-hidden="true"
      />
      <img
        src={logo}
        alt="LoveARt logo"
        className="relative w-20 h-20 sm:w-20 sm:h-20 object-contain"
      />
    </div>
  );
}

interface UnderlineFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  labelRight?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

function UnderlineField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  autoComplete,
  labelRight,
  rightSlot,
}: UnderlineFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-end">
        <label
          htmlFor={name}
          className="text-[10px] uppercase tracking-[0.2em] font-medium"
          style={{ color: "rgba(6,182,212,0.7)" }}
        >
          {label}
        </label>
        {labelRight}
      </div>
      <div
        className="flex items-center pb-2.5 transition-all duration-300"
        style={{ borderBottom: "1px solid rgba(6,182,212,0.3)" }}
      >
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg font-light tracking-wider placeholder:text-slate-700"
          style={{ color: "rgba(241,245,249,0.9)", caretColor: "#06b6d4" }}
        />
        {rightSlot}
      </div>
    </div>
  );
}
