import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routes";
import { useAuthStore } from "../hooks/useAuthStore";

// Pages
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import Home from "../pages/Home";
import ImageTrackingPage from "../pages/ImageTrackingPage";
import ArchitecturePage from "../pages/ArchitecturePage";
import MyLibraryPage from "../pages/MyLibraryPage";

// Layouts
import AppLayout from "../layouts/AppLayout";

/** Redirect to login if not authenticated */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to={ROUTES.LOGIN} replace />
  );
}

export default function Navigation() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path={ROUTES.LANDING} element={<LandingPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* Protected routes — wrapped in AppLayout (sidebar + outlet) */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route
            path={ROUTES.UPLOAD_TRACKING}
            element={<ImageTrackingPage />}
          />
          <Route
            path={ROUTES.UPLOAD_ARCHITECTURE}
            element={<ArchitecturePage />}
          />
          <Route path={ROUTES.LIBRARY} element={<MyLibraryPage />} />
        </Route>

        {/* Wildcard — redirect any unknown route to Landing */}
        <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
