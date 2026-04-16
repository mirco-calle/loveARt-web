import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import { ROUTES } from "../routes/routes";
import { useAuthStore } from "../hooks/useAuthStore";
import { motion } from "framer-motion";
import ModalConfirm from "../components/common/ModalConfirm";
import UserMenuMobile from "../components/common/UserMenuMobile";
import logo from "../assets/logo.png";

const NAV_ITEMS = [
  { to: ROUTES.HOME, icon: "dashboard", label: "Home Studio" },
  { to: ROUTES.UPLOAD_TRACKING, icon: "add_box", label: "Image AR" },
  { to: ROUTES.UPLOAD_ARCHITECTURE, icon: "view_in_ar", label: "Arquitectura" },
  { to: ROUTES.LIBRARY, icon: "grid_view", label: "Biblioteca" },
];

function SidebarLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: string;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-primary/10 text-primary border border-primary/20"
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }`
      }
    >
      <span
        className="material-symbols-outlined text-xl"
        style={{
          fontVariationSettings: `'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24`,
        }}
      >
        {icon}
      </span>
      <span>{label}</span>
    </NavLink>
  );
}

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex bg-background-dark overflow-hidden">
      {/* ──── SIDEBAR (desktop/laptop) ──── */}
      {/* Sidebar hidden on mobile/tablet, shown on lg (laptop/desktop) */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-col border-r border-white/5 bg-surface-dark/60 backdrop-blur-xl shrink-0 transition-all duration-300">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-white/5">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center glow-primary">
            <img src={logo} alt="Logo" className="h-8 w-8" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">LoveArt</h1>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-white/5 bg-white/1">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 shrink-0 rounded-full bg-linear-to-tr from-primary/40 to-blue-600 flex items-center justify-center text-sm font-bold border border-white/10">
              {user?.first_name?.[0] ||
                user?.username?.[0]?.toUpperCase() ||
                "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-none mb-1">
                {user?.first_name || user?.username || "Usuario"}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 text-xs font-medium rounded-lg transition-all duration-200"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ──── MAIN CONTENT ──── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile/Tablet header */}
        <header className="lg:hidden sticky top-0 z-30 pt-safe glass-header shrink-0">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center glow-primary">
                <span className="material-symbols-outlined text-background-dark font-bold text-xl">
                  visibility
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">LoveArt</h1>
            </div>
            <UserMenuMobile
              user={user}
              onLogout={() => setShowLogoutModal(true)}
            />
          </div>
        </header>

        {/* Page content */}
        <motion.main
          className="flex-1 overflow-y-auto scrollbar-hide pb-24 lg:pb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-full h-full max-w-screen-2xl mx-auto overflow-x-hidden">
            <Outlet />
          </div>
        </motion.main>

        {/* ──── BOTTOM NAV (mobile/tablet) ──── */}
        {/* Bottom nav shown on mobile and tablets, hidden on lg */}
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] sm:w-[400px] h-16 bg-surface-dark/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex items-center px-2">
          <div className="flex justify-around items-center w-full">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "text-primary"
                      : "text-slate-500 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className="material-symbols-outlined text-2xl relative z-10"
                      style={{
                        fontVariationSettings: `'FILL' ${isActive ? 1 : 0}, 'wght' ${isActive ? 400 : 300}, 'GRAD' 0, 'opsz' 24`,
                      }}
                    >
                      {item.icon}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5 relative z-10">
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary/10 rounded-xl"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* Logout confirmation modal - Portable */}
      <ModalConfirm
        isOpen={showLogoutModal}
        variant="danger"
        icon="logout"
        title="¿Cerrar sesión?"
        description="Se eliminará tu sesión activa y tendrás que volver a iniciar sesión para acceder a tu studio."
        confirmLabel="Sí, cerrar sesión"
        cancelLabel="Cancelar"
        isLoading={isLoading}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
