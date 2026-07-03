import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/layout/Layout";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Customer pages
import CustomerDashboard from "./pages/customer/Dashboard";
import InsurancePlan from "./pages/customer/InsurancePlan";
import PremiumCalculation from "./pages/customer/PremiumCalculation";
import Payment from "./pages/customer/Payment";
import InsuranceCard from "./pages/customer/InsuranceCard";
import Claims from "./pages/customer/Claims";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Customer routes */}
            <Route element={<ProtectedRoute allowedRoles={["customer"]}><Layout /></ProtectedRoute>}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/plans" element={<InsurancePlan />} />
              <Route path="/customer/premium" element={<PremiumCalculation />} />
              <Route path="/customer/payment" element={<Payment />} />
              <Route path="/customer/insurance-card" element={<InsuranceCard />} />
              <Route path="/customer/claims" element={<Claims />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              background: "#1f2937",
              color: "#f9fafb",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#10B981", secondary: "#fff" } },
            error: { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}