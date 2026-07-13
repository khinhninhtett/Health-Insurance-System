import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/layout/Layout";

// Public pages
import Landing from "./pages/Landing";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Customer pages
import CustomerDashboard from "./pages/customer/Dashboard";
import VerifyProfile from "./pages/customer/VerifyProfile";
import InsurancePlan from "./pages/customer/InsurancePlan";
import MedicalVerification from "./pages/customer/MedicalVerification";
import PremiumCalculation from "./pages/customer/PremiumCalculation";
import Payment from "./pages/customer/Payment";
import InsuranceCard from "./pages/customer/InsuranceCard";
import Claims from "./pages/customer/Claims";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import MedicalVerificationReview from "./pages/admin/MedicalVerificationReview";
import PaymentVerification from "./pages/admin/PaymentVerification";
import ClaimsWorkflow from "./pages/admin/ClaimsWorkflow";
import CustomerManagement from "./pages/admin/CustomerManagement";
import AdminInsurancePlans from "./pages/admin/InsurancePlans";
import Reports from "./pages/admin/Reports";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Customer onboarding */}
            <Route
              path="/customer/verify-profile"
              element={<ProtectedRoute allowedRoles={["customer"]}><VerifyProfile /></ProtectedRoute>}
            />

            {/* Customer routes */}
            <Route element={<ProtectedRoute allowedRoles={["customer"]}><Layout /></ProtectedRoute>}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/plans" element={<InsurancePlan />} />
              <Route path="/customer/medical-verification" element={<MedicalVerification />} />
              <Route path="/customer/premium" element={<PremiumCalculation />} />
              <Route path="/customer/payment" element={<Payment />} />
              <Route path="/customer/insurance-card" element={<InsuranceCard />} />
              <Route path="/customer/claims" element={<Claims />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]}><Layout /></ProtectedRoute>}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/medical-verification" element={<MedicalVerificationReview />} />
              <Route path="/admin/payments" element={<PaymentVerification />} />
              <Route path="/admin/claims" element={<ClaimsWorkflow />} />
              <Route path="/admin/customers" element={<CustomerManagement />} />
              <Route path="/admin/plans" element={<AdminInsurancePlans />} />
              <Route path="/admin/reports" element={<Reports />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
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