import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { Heart, ArrowRight } from "lucide-react";

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  nrc: string;
  password: string;
  confirmPassword: string;
  role: "customer" | "hospital" | "admin";
}

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({ defaultValues: { role: "customer" } });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setErrorMsg(null);
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          nrc: data.nrc,
          password: data.password,
          role: data.role
        }),
      });

      const result = await response.json();

console.log("Status:", response.status);
console.log("Response:", result);

if (!response.ok) {
  throw new Error(result.message || JSON.stringify(result));
}

      // Automatically navigate user back to the login gateway
      navigate("/login");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong during account provisioning.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 shadow-lg shadow-blue-500/30 mb-4">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-gray-900 dark:text-white">Create account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join HealthInsure Management System</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-6">
          
          {errorMsg && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Account Type</label>
              <select
                {...register("role")}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="customer">Customer</option>
                <option value="hospital">Hospital Staff</option>
              </select>
            </div>

            {[
              { name: "name", label: "Full Name", placeholder: "Aung Kyaw Zin", type: "text" },
              { name: "email", label: "Email", placeholder: "you@example.com", type: "email" },
              { name: "phone", label: "Phone Number", placeholder: "+95 9 XXX XXX XXX", type: "tel" },
              { name: "nrc", label: "NRC Number", placeholder: "12/OuKaMa(N)XXXXXX", type: "text" },
            ].map(({ name, label, placeholder, type }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                <input
                  {...register(name as keyof RegisterForm, { required: `${label} is required` })}
                  type={type}
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                />
                {errors[name as keyof RegisterForm] && (
                  <p className="mt-1 text-xs text-red-500">{errors[name as keyof RegisterForm]?.message}</p>
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <input
                {...register("password", { required: "Password required", minLength: { value: 6, message: "Min 6 characters" } })}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
              <input
                {...register("confirmPassword", {
                  required: "Please confirm password",
                  validate: (val) => val === watch("password") || "Passwords do not match",
                })}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white font-medium hover:from-blue-700 hover:to-teal-700 disabled:opacity-60 transition-all shadow-md shadow-blue-500/20"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}