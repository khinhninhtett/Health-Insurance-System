import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { CheckCircle, Star, ArrowRight, Shield, Clock, ShieldAlert } from "lucide-react";
import { apiFetch } from "../../utils/api";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import { formatCurrency } from "../../utils/helpers";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

interface Plan {
  id: number;
  name: string;
  description: string;
  coverage_amount: number;
  monthly_premium: number;
  annual_premium: number;
  benefits: string[];
  color: string;
  popular: boolean;
}

interface UserPlan {
  id: number;
  plan_id: number;
  status: string;
  plan_name: string;
}

const colorMap: Record<string, { gradient: string; border: string }> = {
  blue: { gradient: "from-blue-500 to-blue-700", border: "border-blue-200 dark:border-blue-700" },
  teal: { gradient: "from-teal-500 to-teal-700", border: "border-teal-200 dark:border-teal-700" },
  purple: { gradient: "from-purple-500 to-purple-700", border: "border-purple-200 dark:border-purple-700" },
};

const NEXT_STEP: Record<string, { label: string; path: string }> = {
  pending_medical: { label: "Continue to medical verification", path: "/customer/medical-verification" },
  pending_payment: { label: "Continue to payment", path: "/customer/payment" },
  active: { label: "View insurance card", path: "/customer/insurance-card" },
};

export default function InsurancePlan() {
  const { user } = useAuth();
  const isVerified = user?.verificationStatus === "verified";
  const isPendingIdentity = user?.verificationStatus === "pending";
  const [plans, setPlans] = useState<Plan[]>([]);
  const [myPlan, setMyPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const load = () => {
    Promise.all([apiFetch("/api/plans"), apiFetch("/api/plans/me")])
      .then(([plansRes, myPlanRes]) => {
        setPlans(plansRes.plans);
        setMyPlan(myPlanRes.userPlan);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useAutoRefresh(load);

  const hasOpenEnrollment = myPlan && myPlan.status !== "rejected" && myPlan.status !== "expired";

  const handleSelect = async (planId: number) => {
    if (!isVerified) {
      if (isPendingIdentity) {
        toast.error("Your identity verification is still awaiting admin approval.");
      } else {
        toast.error("Verify your identity before purchasing insurance.");
        navigate("/customer/verify-profile");
      }
      return;
    }

    setSelectingId(planId);
    try {
      await apiFetch("/api/plans/select", { method: "POST", body: JSON.stringify({ planId }) });
      toast.success("Plan selected! Let's verify your medical details next.");
      navigate("/customer/medical-verification");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSelectingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insurance Plans"
        subtitle="Choose the plan that best fits your healthcare needs"
      />

      {!isVerified && !hasOpenEnrollment && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-center gap-4 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {isPendingIdentity ? "Your identity verification is awaiting admin approval" : "Verify your identity before buying insurance"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isPendingIdentity
                ? "You'll be able to purchase a plan once an admin approves your documents."
                : "Upload your NRC photo and a personal photo to unlock plan purchases."}
            </p>
          </div>
          {!isPendingIdentity && (
            <button
              onClick={() => navigate("/customer/verify-profile")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium hover:from-amber-600 hover:to-orange-700 transition-all shrink-0"
            >
              Verify now <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {hasOpenEnrollment && myPlan && (
        <GlassCard className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                You have an enrollment in progress: {myPlan.plan_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Status: {myPlan.status.replace("_", " ")}</p>
            </div>
          </div>
          {NEXT_STEP[myPlan.status] && (
            <button
              onClick={() => navigate(NEXT_STEP[myPlan.status].path)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm hover:from-blue-700 hover:to-teal-700 transition-all"
            >
              {NEXT_STEP[myPlan.status].label} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </GlassCard>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, i) => {
          const colors = colorMap[plan.color] || colorMap.blue;
          const isCurrent = myPlan?.plan_id === plan.id && hasOpenEnrollment;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative h-full flex flex-col rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                isCurrent ? `${colors.border} shadow-xl shadow-black/10` : "border-gray-200 dark:border-gray-800"
              }`}
            >
              {!!plan.popular && (
                <div className="absolute top-0 left-0 right-0 flex justify-center">
                  <div className={`px-4 py-1 text-xs font-semibold text-white bg-gradient-to-r ${colors.gradient} rounded-b-lg`}>
                    <Star className="w-3 h-3 inline mr-1" />Most Popular
                  </div>
                </div>
              )}

              <div className={`p-5 bg-gradient-to-br ${colors.gradient} ${plan.popular ? "pt-8" : ""}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Plan</p>
                    <h3 className="text-white text-xl mt-0.5">{plan.name}</h3>
                  </div>
                  <Shield className="w-8 h-8 text-white/60" />
                </div>
                <div className="mt-4">
                  <p className="text-white/70 text-xs">Coverage Amount</p>
                  <p className="text-white text-2xl font-semibold">{formatCurrency(plan.coverage_amount)}</p>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-gray-900 flex-1 flex flex-col">
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Annual Premium</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(plan.annual_premium)} <span className="text-sm font-normal text-gray-400">/ year</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Pay once, or in 12 monthly installments of {formatCurrency(Math.round(plan.annual_premium / 12))}
                  </p>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{plan.description}</p>

                <ul className="space-y-2 mb-6">
                  {plan.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(plan.id)}
                  disabled={!!hasOpenEnrollment || selectingId === plan.id}
                  className={`mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCurrent
                      ? `bg-gradient-to-r ${colors.gradient} text-white shadow-md`
                      : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {selectingId === plan.id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isCurrent ? (
                    <><CheckCircle className="w-4 h-4" /> Selected</>
                  ) : (
                    <>Select Plan <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Plan Comparison */}
      <GlassCard className="p-6">
        <h3 className="text-gray-900 dark:text-white mb-4">Plan Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 pr-4 text-gray-500 dark:text-gray-400 font-medium">Feature</th>
                {plans.map((p) => (
                  <th key={p.id} className="text-center py-3 px-4 text-gray-900 dark:text-white font-medium">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Coverage", ...plans.map((p) => formatCurrency(p.coverage_amount))],
                ["Annual Premium", ...plans.map((p) => formatCurrency(p.annual_premium))],
                ["Monthly Installment (× 12)", ...plans.map((p) => formatCurrency(Math.round(p.annual_premium / 12)))],
              ].map(([feature, ...vals]) => (
                <tr key={feature} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{feature}</td>
                  {vals.map((val, i) => (
                    <td key={i} className="text-center py-3 px-4 text-gray-900 dark:text-white">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
