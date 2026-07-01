import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout and pages
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

// Store
import useAuthStore from "./store/useAuthStore";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "14px",
          },
        }}
      />

      <Routes>
        {/* Layout wraps all routes — Navbar appears on every page */}
        <Route path="/" element={<Layout />}>
          {/* Public routes — no auth required */}
          <Route index element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
          {/* Protected routes — auth required */}
          <Route
            path="/issues"
            element={
              <ProtectedRoute>
                <div>Issues page (protected)</div>
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
