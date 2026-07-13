import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { toJpeg } from "html-to-image";
import { Download, Printer, Shield, Calendar, CreditCard, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../utils/api";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import { formatDate, formatCurrency } from "../../utils/helpers";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";

interface UserPlan {
  status: string;
  policy_number: string;
  plan_name: string;
  plan_benefits: string[];
  coverage_amount: number;
  coverage_used: number;
  start_date: string;
  end_date: string;
}

export default function InsuranceCard() {
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const [myPlan, setMyPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current || !myPlan) return;
    setDownloading(true);
    try {
      // JPG has no transparency, so fill behind the card's rounded corners
      // with the page background of the current theme.
      const isDark = document.documentElement.classList.contains("dark");
      const dataUrl = await toJpeg(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: isDark ? "#111827" : "#f9fafb",
        // Neutralize inherited layout offsets (auto margins, entry-animation
        // transforms) so the clone renders at the canvas origin.
        style: { margin: "0", transform: "none" },
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `insurance-card-${myPlan.policy_number}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Insurance card downloaded!");
    } catch {
      toast.error("Could not generate the card image. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const load = () => {
    apiFetch("/api/plans/me")
      .then((res) => setMyPlan(res.userPlan))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useAutoRefresh(load);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!myPlan || myPlan.status !== "active") {
    return (
      <div className="space-y-6">
        <PageHeader title="Insurance Card" subtitle="Your official health insurance policy card" />
        <GlassCard className="p-12 text-center max-w-lg mx-auto">
          <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">No active policy yet</p>
          <p className="text-sm text-gray-400 mt-1">
            {myPlan ? `Your enrollment is currently: ${myPlan.status.replace("_", " ")}.` : "Select a plan to get started."}
          </p>
          <Link to="/customer/plans" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm">
            Go to plans <ArrowRight className="w-4 h-4" />
          </Link>
        </GlassCard>
      </div>
    );
  }

  const policyData = JSON.stringify({ policyNumber: myPlan.policy_number, name: user?.name, plan: myPlan.plan_name });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insurance Card"
        subtitle="Your official health insurance policy card"
        action={
          <div className="flex gap-2">
            <button onClick={() => { toast.success("Printing..."); window.print(); }} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm hover:from-blue-700 hover:to-teal-700 disabled:opacity-60 transition-all shadow-md shadow-blue-500/20"
            >
              {downloading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {downloading ? "Preparing..." : "Download"}
            </button>
          </div>
        }
      />

      <div className="max-w-lg mx-auto">
        <motion.div ref={cardRef} initial={{ opacity: 0, rotateY: -10 }} animate={{ opacity: 1, rotateY: 0 }} transition={{ duration: 0.5 }} className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20">
          <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-teal-800 p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/5" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-emerald-400" />
                  <span className="text-white font-semibold">Insure<span className="text-emerald-400">Glass</span></span>
                </div>
                <span className="bg-emerald-400 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded-full">ACTIVE</span>
              </div>

              <div className="mb-6">
                <p className="text-blue-200 text-xs mb-1">Policy Number</p>
                <p className="text-white text-lg font-mono font-bold tracking-wider">{myPlan.policy_number}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-200 text-xs">Insured Person</p>
                  <p className="text-white font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs">Plan</p>
                  <p className="text-white font-medium">{myPlan.plan_name}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs text-gray-400">Valid From</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(myPlan.start_date)}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs text-gray-400">Valid Until</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(myPlan.end_date)}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs text-gray-400">Coverage Remaining</p>
                </div>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(myPlan.coverage_amount - myPlan.coverage_used)}
                </p>
              </div>
              <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100">
                <QRCodeSVG value={policyData} size={70} level="M" />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
              <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                In case of emergency, call: <strong>+95 1 999 000</strong>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <GlassCard className="p-6 max-w-lg mx-auto">
        <h3 className="text-gray-900 dark:text-white mb-4">Coverage Summary</h3>
        <div className="space-y-2">
          {myPlan.plan_benefits.map((b) => (
            <div key={b} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              {b}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
