import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import SalaryEntry from "@/pages/SalaryEntry";
import Workers from "@/pages/Workers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Route: Login */}
            <Route path="/" element={<Login />} />

            {/* Protected Routes with Navbar */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/salary-entry"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <SalaryEntry />
                </ProtectedRoute>
              }
            />

            <Route
              path="/workers"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Workers />
                </ProtectedRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
