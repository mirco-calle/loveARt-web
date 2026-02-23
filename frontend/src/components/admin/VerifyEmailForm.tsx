import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ROUTES } from "../../routes/routes";
import { verifyEmail, resendVerificationEmail } from "../../api/Auth";
import { slideTrans, slideVariants, Spinner } from "../../pages/LoginPage";
import { useAuthStore } from "../../hooks/useAuthStore";

// ─── Constants ────────────────────────────────────────────────────────────────
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 59;

// ─── Props ────────────────────────────────────────────────────────────────────
interface VerifyEmailFormProps {
  /** Email address to verify — shown in the description */
  email: string;
  /** Navigate back to the register form */
  onBack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function VerifyEmailForm({
  email,
  onBack,
}: VerifyEmailFormProps) {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);

  // Countdown timer
  const [seconds, setSeconds] = useState(RESEND_COOLDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);

  // Refs for each OTP input box
  const inputRefs = useRef<Array<HTMLInputElement | null>>(
    Array(OTP_LENGTH).fill(null),
  );

  // Auto-focus the first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown logic
  useEffect(() => {
    if (seconds <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const formattedTime = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  // ── OTP input handlers ──────────────────────────────────────────────────────

  const focusAt = (index: number) => inputRefs.current[index]?.focus();

  const handleChange = (index: number, value: string) => {
    // Allow only a single numeric digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    // Auto-advance to the next input
    if (digit && index < OTP_LENGTH - 1) {
      focusAt(index + 1);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        // Clear the current cell
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        // Move to the previous cell and clear it
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
        focusAt(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusAt(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusAt(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = [...digits];
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);

    // Focus the cell after the last pasted digit
    const nextFocusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    focusAt(nextFocusIndex);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      toast.warning("Please enter all 6 digits.");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await verifyEmail({ email, code });

      // Auto-login the user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSession(
        (data as any).user,
        (data as any).access,
        (data as any).refresh,
      );

      toast.success("¡Email verificado! Bienvenido.");
      navigate(ROUTES.HOME);
    } catch {
      toast.error("Código incorrecto o expirado. Inténtalo de nuevo.");
      // Clear inputs and refocus
      setDigits(Array(OTP_LENGTH).fill(""));
      focusAt(0);
    } finally {
      setIsLoading(false);
    }
  }, [digits, email, navigate, setSession]);

  // Auto-submit when all digits are filled
  useEffect(() => {
    if (digits.every((d) => d !== "")) {
      handleSubmit();
    }
  }, [digits, handleSubmit]);

  // ── Resend ──────────────────────────────────────────────────────────────────

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await resendVerificationEmail({ email });
      toast.success("Nuevo código enviado a tu correo.");
      setSeconds(RESEND_COOLDOWN_SECONDS);
      setCanResend(false);
      setDigits(Array(OTP_LENGTH).fill(""));
      focusAt(0);
    } catch {
      toast.error("No se pudo reenviar el código. Intenta más tarde.");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <motion.div
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={slideTrans}
      className="flex-1 flex flex-col px-8 py-10 sm:px-12 sm:py-12"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm self-start transition-opacity hover:opacity-70 text-slate-500 font-bold uppercase tracking-widest"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Atrás
      </button>

      <div className="flex-1 flex flex-col items-center justify-center gap-10 sm:gap-14">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-violet-600/10 mb-6">
            <div className="absolute inset-0 rounded-full bg-violet-600/20 blur-xl animate-pulse" />
            <span className="material-symbols-outlined text-4xl text-violet-500">
              mark_email_read
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Verifica tu email
          </h2>
          <p className="text-sm mt-3 text-slate-500 max-w-[280px] leading-relaxed">
            Hemos enviado un código a <br />
            <span className="text-cyan-400 font-bold">{email}</span>
          </p>
        </div>

        <div className="w-full space-y-10">
          <div
            className="flex justify-center gap-2 sm:gap-4"
            onPaste={handlePaste}
          >
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                placeholder="•"
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-14 sm:w-14 sm:h-20 text-center text-2xl font-black rounded-2xl bg-white/5 border-2 border-white/5 focus:border-cyan-500/50 focus:bg-white/10 outline-none transition-all text-cyan-400 placeholder:text-slate-800 shadow-xl"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || digits.some((d) => d === "")}
            className="w-full h-14 sm:h-16 rounded-[20px] bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_0_25px_rgba(139,92,246,0.3)] flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <Spinner />
            ) : (
              <span className="material-symbols-outlined">verified</span>
            )}
            <span>Verificar Código</span>
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-600">
            ¿No recibiste nada?
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className={`text-sm font-black uppercase tracking-widest transition-colors ${
                canResend ? "text-secondary hover:text-white" : "text-slate-700"
              }`}
            >
              Reenviar
            </button>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <div className="flex items-center gap-2 font-mono text-sm text-slate-500 font-bold">
              <span className="material-symbols-outlined text-sm">
                schedule
              </span>
              {canResend ? "00:00" : formattedTime}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
