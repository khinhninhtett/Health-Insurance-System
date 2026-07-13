import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { User, Mail, Phone, IdCard, Lock } from "lucide-react";
import AuthShell from "../../components/shared/AuthShell";

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  nrc: string;
  password: string;
  confirmPassword: string;
  role: "customer" | "hospital" | "admin";
}

const inputClass =
  "w-full pl-11 pr-4 py-3 rounded-xl bg-[#141b40] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all";

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
          role: data.role,
        }),
      });

      const result = await response.json();

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

  const fields = [
    { name: "name", label: "Full Name", placeholder: "Khin Hnin", type: "text", icon: User, rules: {} },
    {
      name: "email",
      label: "Email Address",
      placeholder: "name@company.com",
      type: "email",
      icon: Mail,
      rules: { pattern: { value: /^\S+@\S+$/, message: "Invalid email address" } },
    },
    {
      name: "phone",
      label: "Phone Number",
      placeholder: "09787950760",
      type: "tel",
      icon: Phone,
      maxLength: 11,
      hint: "Myanmar number starting with 09, up to 11 digits",
      rules: {
        validate: (value: string) =>
          /^09\d{7,9}$/.test(String(value).replace(/[\s-]/g, "")) ||
          "Enter a valid Myanmar phone number, e.g. 09787950760 (starts with 09, 9–11 digits)",
      },
    },
    { name: "nrc", label: "NRC Number", placeholder: "12/OuKaMa(N)XXXXXX", type: "text", icon: IdCard, rules: {} },
  ] as const;

  return (
    <AuthShell
      title="Create Account"
      subtitle={
        <>
          Already a member?{" "}
          <Link to="/login" className="text-emerald-400 underline hover:text-emerald-300">Sign in here</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="hidden text-sm font-medium text-gray-200 mb-2">Account Type</label>
          <select
            {...register("role")}
            className="hidden w-full px-4 py-3 rounded-xl bg-[#141b40] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <option value="customer">Customer</option>
          </select>
        </div>

        {fields.map(({ name, label, placeholder, type, icon: Icon, rules, ...rest }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-200 mb-2">{label}</label>
            <div className="relative">
              <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                {...register(name, { required: `${label} is required`, ...rules })}
                type={type}
                placeholder={placeholder}
                maxLength={"maxLength" in rest ? rest.maxLength : undefined}
                className={inputClass}
              />
            </div>
            {errors[name] ? (
              <p className="mt-1 text-xs text-red-400">{errors[name]?.message}</p>
            ) : "hint" in rest && rest.hint ? (
              <p className="mt-1 text-xs text-gray-500">{rest.hint}</p>
            ) : null}
          </div>
        ))}

        {[
          { name: "password", label: "Password" },
          { name: "confirmPassword", label: "Confirm Password" },
        ].map(({ name, label }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-200 mb-2">{label}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                {...register(
                  name as "password" | "confirmPassword",
                  name === "password"
                    ? { required: "Password required", minLength: { value: 6, message: "Min 6 characters" } }
                    : { required: "Please confirm password", validate: (val) => val === watch("password") || "Passwords do not match" }
                )}
                type="password"
                placeholder="••••••••••••"
                className={inputClass}
              />
            </div>
            {errors[name as "password" | "confirmPassword"] && (
              <p className="mt-1 text-xs text-red-400">{errors[name as "password" | "confirmPassword"]?.message}</p>
            )}
          </div>
        ))}

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
            {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "Create Account"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
