import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { ROUTES } from "../routes/routes";
import { useAuthStore } from "../hooks/useAuthStore";
import LoginForm from "../components/admin/LoginForm";
import VerifyEmailForm from "../components/admin/VerifyEmailForm";
import RegisterForm from "../components/admin/RegisterForm";
import logo from "../assets/logo.png";

// ─── Types ────────────────────────────────────────────────────────────────────
export type AuthView = "selector" | "login" | "register" | "verify";

// ─── Shared micro-components ──────────────────────────────────────────────────
export const Spinner = () => (
  <svg
    className="animate-spin w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// ─── Animation presets ────────────────────────────────────────────────────────
export const slideVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
} as const;

export const slideTrans = { duration: 0.26, ease: "easeInOut" as const };

// ─── Selector view ────────────────────────────────────────────────────────────
interface SelectorViewProps {
  onGoogleSuccess: (response: CredentialResponse) => void;
  onGoogleError: () => void;
  onEmailLogin: () => void;
  isLoading: boolean;
}

function SelectorView({
  onGoogleSuccess,
  onGoogleError,
  onEmailLogin,
  isLoading,
}: SelectorViewProps) {
  return (
    <motion.div
      key="selector"
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={slideTrans}
      className="flex-1 flex flex-col items-center justify-center gap-10 sm:gap-14 px-8 py-12 sm:px-12 md:px-16"
    >
      {/* ── Branding ── */}
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-6">
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{ background: "rgba(139,92,246,0.3)", filter: "blur(32px)" }}
            aria-hidden="true"
          />
          <img
            src={logo}
            alt="LoveArt"
            className="relative w-full h-full object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
          />
        </div>
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter"
          style={{
            color: "#8b5cf6",
            textShadow: "0 0 30px rgba(139,92,246,0.4)",
          }}
        >
          LoveArt
        </h1>
        <p className="text-[12px] uppercase tracking-[0.6em] mt-3 font-bold text-slate-500">
          AR Creative Studio
        </p>
      </div>

      {/* ── Auth buttons ── */}
      <div className="w-full flex flex-col gap-4 sm:gap-5 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background-dark/50 backdrop-blur-sm rounded-[20px]">
            <Spinner />
          </div>
        )}

        <div className="w-full flex justify-center overflow-hidden rounded-[20px] shadow-lg shadow-cyan-500/10">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
            useOneTap
            theme="filled_black"
            shape="pill"
            size="large"
            text="continue_with"
            width="320"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 px-2">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-600">
            o utiliza
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          onClick={onEmailLogin}
          className="w-full h-14 sm:h-16 rounded-[20px] flex items-center justify-center gap-4 transition-all duration-300 active:scale-95 bg-white/2 border border-violet-500/30 hover:border-violet-500 shadow-lg shadow-violet-500/10 text-white"
        >
          <span className="material-symbols-outlined text-violet-400">
            mail
          </span>
          <span className="text-sm sm:text-base font-bold tracking-tight">
            Acceso por Email
          </span>
        </button>
      </div>

      {/* ── Footer ── */}
      <div className="flex flex-col items-center gap-6">
        <Link
          to={ROUTES.LANDING}
          className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-white transition-colors"
        >
          ← Volver al inicio
        </Link>
        <div className="w-32 h-1.5 rounded-full bg-white/5" />
      </div>
    </motion.div>
  );
}

// ─── Auth card shell ──────────────────────────────────────────────────────────
function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="relative z-10 w-full flex flex-col min-h-screen sm:min-h-0 sm:max-w-md sm:rounded-[48px] sm:border border-white/10 bg-background-dark/90 backdrop-blur-3xl shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithGoogle, isLoading } = useAuthStore();
  const [view, setView] = useState<AuthView>("selector");
  const [pendingEmail, setPendingEmail] = useState("");
  const [verifySource, setVerifySource] = useState<"register" | "login">(
    "register",
  );

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    try {
      if (response.credential) {
        await loginWithGoogle({ credential: response.credential });
        toast.success("¡Bienvenido, artista!");
        navigate(ROUTES.HOME);
      }
    } catch {
      toast.error("Error con Google. Intenta de nuevo.");
    }
  };

  const handleGoogleError = () => {
    toast.error("Falló la autenticación con Google");
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center sm:p-8"
      style={{
        backgroundColor: "#030014",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Dynamic Background */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[140px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/10 blur-[140px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div className="grid-bg absolute inset-0 opacity-[0.1]" />
      </div>

      <AuthCard>
        <AnimatePresence mode="wait">
          {view === "selector" && (
            <SelectorView
              key="selector"
              onGoogleSuccess={handleGoogleSuccess}
              onGoogleError={handleGoogleError}
              onEmailLogin={() => setView("login")}
              isLoading={isLoading}
            />
          )}

          {view === "login" && (
            <LoginForm
              key="login"
              onBack={() => setView("selector")}
              onGoRegister={() => setView("register")}
              onNeedsVerify={(identifier) => {
                setPendingEmail(identifier);
                setVerifySource("login");
                setView("verify");
              }}
            />
          )}

          {view === "verify" && (
            <VerifyEmailForm
              key="verify"
              email={pendingEmail}
              onBack={() =>
                setView(verifySource === "login" ? "login" : "register")
              }
            />
          )}

          {view === "register" && (
            <RegisterForm
              key="register"
              onBack={() => setView("selector")}
              onGoLogin={() => setView("login")}
              onVerifyEmail={(email) => {
                setPendingEmail(email);
                setVerifySource("register");
                setView("verify");
              }}
            />
          )}
        </AnimatePresence>
      </AuthCard>
    </div>
  );
}
