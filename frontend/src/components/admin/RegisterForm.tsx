import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { registerUser } from "../../api/Auth";
import { slideTrans, slideVariants, Spinner } from "../../pages/LoginPage";
import logo from "../../assets/logo.png";

// ─── Props ────────────────────────────────────────────────────────────────────
interface RegisterFormProps {
  /** Navigate back to the selector view */
  onBack: () => void;
  /** Navigate directly to the login form */
  onGoLogin: () => void;
  /** Called with the registered email to move to the OTP verification view */
  onVerifyEmail: (email: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterForm({
  onBack,
  onGoLogin,
  onVerifyEmail,
}: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.password_confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);
    try {
      // Derive a unique-ish username from name or email
      const sanitizedName = form.full_name
        .trim()
        .replace(/\s+/g, ".")
        .toLowerCase();
      const username = sanitizedName || form.email.split("@")[0];

      await registerUser({
        username,
        email: form.email,
        password: form.password,
        password_confirm: form.password_confirm,
        first_name: form.full_name,
      });
      toast.success("¡Cuenta creada! Verifica tu email.");
      // Move to OTP verification passing the registered email
      onVerifyEmail(form.email);
    } catch (err: unknown) {
      // Extract and display the real validation error from Django
      const axiosErr = err as {
        response?: { data?: Record<string, string | string[]> };
      };
      const data = axiosErr?.response?.data;

      if (data && typeof data === "object") {
        // Django returns field-level errors as { field: ["message"] }
        const messages = Object.entries(data)
          .map(([field, msgs]) => {
            const text = Array.isArray(msgs) ? msgs.join(" ") : String(msgs);
            return field === "non_field_errors" ? text : `${field}: ${text}`;
          })
          .join(" · ");
        toast.error(messages || "Error al crear la cuenta.");
      } else {
        toast.error("Error al crear la cuenta. Intenta de nuevo.");
      }

      // Log for debugging
      console.error("[Register 400]", data);
    } finally {
      setIsLoading(false);
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
        <div className="relative w-24 h-24 flex items-center justify-center mb-4">
          <div
            className="absolute inset-0 rounded-full animate-pulse blur-[32px]"
            style={{ background: "rgba(168,85,247,0.3)" }}
            aria-hidden="true"
          />
          <img
            src={logo}
            alt="LoveArt"
            className="relative w-full h-full object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
          />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-6 text-violet-400">
          Crea tu cuenta
        </h2>
        <p className="text-[12px] uppercase tracking-[0.4em] mt-2 font-bold text-slate-500">
          Únete a la revolución AR
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 sm:gap-8 bg-white/2 backdrop-blur-3xl rounded-[32px] p-6 sm:p-10 border border-white/5 shadow-2xl"
      >
        <div className="space-y-6">
          <UnderlineField
            label="Usuario"
            name="full_name"
            placeholder="Cómo quieres que te llamemos"
            value={form.full_name}
            onChange={handleChange}
            autoComplete="name"
            rightSlot={
              <span className="material-symbols-outlined text-slate-600">
                person
              </span>
            }
          />

          <UnderlineField
            label="Email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
            rightSlot={
              <span className="material-symbols-outlined text-slate-600">
                mail
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
            autoComplete="new-password"
            required
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

          <UnderlineField
            label="Confirmar"
            name="password_confirm"
            type={showPassword ? "text" : "password"}
            placeholder="Repite la contraseña"
            value={form.password_confirm}
            onChange={handleChange}
            autoComplete="new-password"
            required
            rightSlot={
              <span className="material-symbols-outlined text-slate-600">
                lock_reset
              </span>
            }
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 sm:h-16 rounded-[20px] bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_0_25px_rgba(139,92,246,0.3)] flex items-center justify-center gap-3 mt-4"
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <span className="material-symbols-outlined">person_add</span>
          )}
          <span>Crear Cuenta</span>
        </button>

        <p className="text-center text-sm font-medium text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <button
            type="button"
            onClick={onGoLogin}
            className="text-secondary font-bold hover:underline underline-offset-4"
          >
            Inicia sesión
          </button>
        </p>
      </form>

      <p className="text-[11px] text-center mt-8 leading-relaxed text-slate-600 px-6">
        Al registrarte, aceptas nuestros{" "}
        <span className="text-violet-400 hover:underline cursor-pointer">
          Términos de Servicio
        </span>{" "}
        y{" "}
        <span className="text-violet-400 hover:underline cursor-pointer">
          Política de Privacidad
        </span>
        .
      </p>
    </motion.div>
  );
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-sm mb-5 sm:mb-7 transition-opacity hover:opacity-70 self-start shrink-0"
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
      Atrás
    </button>
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
  rightSlot,
}: UnderlineFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={name}
        className="text-[10px] uppercase tracking-[0.2em] font-medium"
        style={{ color: "rgba(6,182,212,0.7)" }}
      >
        {label}
      </label>
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
