import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AppSidebar from "./components/layouts/sidebar";
import Dashboard from "./components/dashboard/Dashboard";
import Bill from "./components/pages/Bill";
import Orders from "./components/pages/Orders";
import Inventory from "./components/pages/Inventory";
import Overview from "./components/pages/Overview";
import Employees from "./components/pages/Employees";
import Transportation from "./components/pages/Transportation";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // Listen for authentication changes
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <Router>
      <AppContent
        isAuthenticated={isAuthenticated}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
    </Router>
  );
}

function AppContent({ isAuthenticated, collapsed, setCollapsed }) {
  const location = useLocation();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
      {isAuthRoute ? (
        // Full-screen layout for auth routes
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex items-center justify-center">
          <Routes location={location}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/signup" replace />} />
          </Routes>
        </div>
      ) : (
        // Project layout for protected routes
        <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
          <AppSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
          />
          <div className="flex-1 p-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Routes location={location}>
                  <Route
                    path="/dashboard"
                    element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
                  />
                  <Route
                    path="/overview"
                    element={isAuthenticated ? <Overview /> : <Navigate to="/login" replace />}
                  />
                  <Route
                    path="/bill"
                    element={isAuthenticated ? <Bill /> : <Navigate to="/login" replace />}
                  />
                  <Route
                    path="/orders"
                    element={isAuthenticated ? <Orders /> : <Navigate to="/login" replace />}
                  />
                  <Route
                    path="/inventory"
                    element={isAuthenticated ? <Inventory /> : <Navigate to="/login" replace />}
                  />
                  <Route
                    path="/employees/*"
                    element={isAuthenticated ? <Employees /> : <Navigate to="/login" replace />}
                  />
                  <Route
                    path="/transporation"
                    element={isAuthenticated ? <Transportation /> : <Navigate to="/login" replace />}
                  />
                  <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
}

export default App;


