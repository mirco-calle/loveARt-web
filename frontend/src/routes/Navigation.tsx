import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routes";
import { useAuthStore } from "../hooks/useAuthStore";

// Layouts
import AppLayout from "../layouts/AppLayout";

// Lazy-loaded Pages (Code-splitting for faster initial page loads)
const LandingPage = lazy(() => import("../pages/LandingPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const Home = lazy(() => import("../pages/Home"));
const ImageTrackingPage = lazy(() => import("../pages/ImageTrackingPage"));
const MyLibraryPage = lazy(() => import("../pages/MyLibraryPage"));

const PageLoader = () => (
  <div className="min-h-screen bg-background-dark flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

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
      <Suspense fallback={<PageLoader />}>
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
            <Route path={ROUTES.LIBRARY} element={<MyLibraryPage />} />
          </Route>

          {/* Wildcard — redirect any unknown route to Landing */}
          <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
