import { motion } from "motion/react";
import { Shield, FileText, Activity, CheckCircle, Clock, AlertCircle, CreditCard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { insurancePlans, progressSteps } from "../../data/mockData";
import { formatCurrency, formatDate, getStatusColor } from "../../utils/helpers";
import StatCard from "../../components/shared/StatCard";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const plan = insurancePlans.find((p) => p.id === user?.selectedPlan) || insurancePlans[1];

  const stats = [
    { title: "Insurance Status", value: user?.insuranceStatus === "active" ? "Active" : "Pending", icon: Shield, color: "teal" as const, index: 0 },
    { title: "Current Plan", value: plan.name, icon: FileText, color: "blue" as const, index: 1 },
    { title: "Claims Submitted", value: (user?.claims as unknown[])?.length || 0, icon: Activity, color: "purple" as const, index: 2 },
    { title: "Coverage Amount", value: formatCurrency(plan.coverageAmount), icon: CreditCard, color: "emerald" as const, index: 3 },
  ];

  const steps = progressSteps.map((s, i) => ({
    ...s,
    status: i < 3 ? "completed" : i === 3 ? "current" : "pending",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.name?.split(" ")[0]}! 👋`}
        subtitle="Here's an overview of your insurance status"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Progress Tracker */}
        <GlassCard className="p-6">
          <h3 className="text-gray-900 dark:text-white mb-4">Application Progress</h3>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  step.status === "completed" ? "bg-emerald-500" :
                  step.status === "current" ? "bg-blue-500 animate-pulse" :
                  "bg-gray-200 dark:bg-gray-700"
                }`}>
                  {step.status === "completed" ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : step.status === "current" ? (
                    <Clock className="w-4 h-4 text-white" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${step.status === "pending" ? "text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-200"}`}>
                    {step.label}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`absolute left-[27px] mt-7 w-0.5 h-3 ${step.status === "completed" ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`} />
                )}
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Current Plan */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 dark:text-white">Current Plan</h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor("active")}`}>Active</span>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{plan.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Coverage</p>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(plan.coverageAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Monthly</p>
                  <p className="font-semibold text-teal-600 dark:text-teal-400">{formatCurrency(plan.monthlyPremium)}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Benefits included:</p>
              <ul className="space-y-1">
                {plan.benefits.slice(0, 3).map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Claims */}
      <GlassCard className="p-6">
        <h3 className="text-gray-900 dark:text-white mb-4">Recent Claims</h3>
        {(user?.claims as unknown[])?.length ? (
          <div className="space-y-3">
            {(user?.claims as Array<{id:string;date:string;type:string;description:string;amount:number;status:string;hospital:string}>).map((claim) => (
              <div key={claim.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{claim.type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{claim.hospital} · {formatDate(claim.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(claim.amount)}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>{claim.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No claims submitted yet</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
