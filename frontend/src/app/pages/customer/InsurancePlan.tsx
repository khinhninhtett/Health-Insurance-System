import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle, Star, ArrowRight, Shield } from "lucide-react";
import { insurancePlans } from "../../data/mockData";
import { formatCurrency } from "../../utils/helpers";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";

const colorMap: Record<string, { gradient: string; border: string; badge: string }> = {
  blue: { gradient: "from-blue-500 to-blue-700", border: "border-blue-200 dark:border-blue-700", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  teal: { gradient: "from-teal-500 to-teal-700", border: "border-teal-200 dark:border-teal-700", badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
  purple: { gradient: "from-purple-500 to-purple-700", border: "border-purple-200 dark:border-purple-700", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
};

export default function InsurancePlan() {
  const [selected, setSelected] = useState("plan-002");

  const handleSelect = (planId: string) => {
    setSelected(planId);
    toast.success("Plan selected successfully!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insurance Plans"
        subtitle="Choose the plan that best fits your healthcare needs"
      />

      <div className="grid md:grid-cols-3 gap-6">
        {insurancePlans.map((plan, i) => {
          const colors = colorMap[plan.color];
          const isSelected = selected === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                isSelected ? `${colors.border} shadow-xl shadow-black/10` : "border-gray-200 dark:border-gray-800"
              }`}
            >
              {plan.popular && (
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
                  <p className="text-white text-2xl font-semibold">{formatCurrency(plan.coverageAmount)}</p>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Premium</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(plan.monthlyPremium)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Annual</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatCurrency(plan.annualPremium)}</p>
                  </div>
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
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${
                    isSelected
                      ? `bg-gradient-to-r ${colors.gradient} text-white shadow-md`
                      : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {isSelected ? (
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
                {insurancePlans.map((p) => (
                  <th key={p.id} className="text-center py-3 px-4 text-gray-900 dark:text-white font-medium">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Coverage", ...insurancePlans.map((p) => formatCurrency(p.coverageAmount))],
                ["Monthly Premium", ...insurancePlans.map((p) => formatCurrency(p.monthlyPremium))],
                ["Annual Premium", ...insurancePlans.map((p) => formatCurrency(p.annualPremium))],
                ["Outpatient Care", "✓", "✓", "✓"],
                ["Emergency Care", "✓", "✓", "✓"],
                ["Specialist Consult", "✗", "✓", "✓"],
                ["Surgery", "✗", "✓", "✓"],
                ["Dental & Vision", "✗", "✓", "✓"],
                ["International Coverage", "✗", "✗", "✓"],
                ["Cancer Treatment", "✗", "✗", "✓"],
              ].map(([feature, ...vals]) => (
                <tr key={feature} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{feature}</td>
                  {vals.map((val, i) => (
                    <td key={i} className={`text-center py-3 px-4 ${val === "✓" ? "text-emerald-500" : val === "✗" ? "text-gray-300 dark:text-gray-600" : "text-gray-900 dark:text-white"}`}>
                      {val}
                    </td>
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
