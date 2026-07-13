import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/shared/AuthShell";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Invalid credentials");
      }

      // Sync AuthContext (not just localStorage) so protected routes see the
      // logged-in user immediately, without waiting for a full page reload.
      setSession(result.user, result.token);

      // Handle Role-based routing matching your backend dynamic schema returns
      const redirects: Record<string, string> = {
        customer: "/customer/dashboard",
        hospital: "/hospital/dashboard",
        admin: "/admin/dashboard",
      };

      navigate(redirects[result.user.role] || "/login");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle={
        <>
          New to InsureGlass?{" "}
          <Link to="/register" className="text-emerald-400 underline hover:text-emerald-300">Sign up here</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/, message: "Invalid email" } })}
              type="email"
              placeholder="name@company.com"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#141b40] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              {...register("password", { required: "Password is required" })}
              type={showPass ? "text" : "password"}
              placeholder="••••••••••••"
              className="w-full pl-11 pr-11 py-3 rounded-xl bg-[#141b40] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
            />
            <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">Forgot password?</Link>
        </div>

        {errorMsg && (
          <div className="p-3 text-sm text-red-400 bg-red-950/30 rounded-xl border border-red-900/50">
            {errorMsg}
          </div>
        )}

        <div className="pt-2 flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-12 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#04120b] font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-500/25"
          >
            {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "Sign In to Portal"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
