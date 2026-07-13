import { ReactNode } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Shield, Activity, X } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#10173a] flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-5xl grid md:grid-cols-2 rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/40"
      >
        {/* Close */}
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand panel */}
        <div className="hidden md:flex flex-col justify-between p-10 border-r border-white/10 bg-[#060b26] bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.22),transparent_60%)]">
          <div className="flex items-center gap-2.5">
            <Shield className="w-8 h-8 text-emerald-400" strokeWidth={1.8} />
            <span className="text-xl font-semibold text-white">
              Insure<span className="text-emerald-400">Glass</span>
            </span>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-400/30 bg-white/5 text-emerald-300 text-[11px] tracking-widest uppercase mb-6">
              <Activity className="w-3.5 h-3.5" />
              Secure HIPAA Compliant Portal
            </div>
            <h2 className="font-serif text-3xl font-bold text-white leading-snug mb-5">
              Manage your coverage, claims, and health metrics in one single place.
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Access premium medical networks, submit instant digital claims, and consult with underwriters 24/7.
            </p>
          </div>

          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} InsureGlass Inc. All operations encrypted via end-to-end TLS.
          </p>
        </div>

        {/* Form panel */}
        <div className="bg-[#0a1029] p-8 sm:p-12 max-h-[90vh] overflow-y-auto scrollbar-thin">
          {/* Compact brand for mobile, where the left panel is hidden */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            <Shield className="w-6 h-6 text-emerald-400" strokeWidth={1.8} />
            <span className="font-semibold text-white">
              Insure<span className="text-emerald-400">Glass</span>
            </span>
          </div>

          <h1 className="font-serif text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-sm text-gray-400 mb-8">{subtitle}</p>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
