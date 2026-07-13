import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Plus, Edit2, Trash2, Shield, X, CheckCircle, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { apiFetch } from "../../utils/api";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import { formatCurrency } from "../../utils/helpers";
import PageHeader from "../../components/shared/PageHeader";
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
  popular: boolean | number;
  status: string;
}

interface PlanForm {
  name: string;
  coverageAmount: number;
  annualPremium: number;
  description: string;
  benefits: string;
  color: string;
  popular: boolean;
}

const colorMap: Record<string, string> = {
  blue: "from-blue-500 to-blue-700",
  teal: "from-teal-500 to-teal-700",
  purple: "from-purple-500 to-purple-700",
};

export default function InsurancePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<PlanForm>();

  const load = () => {
    apiFetch("/api/admin/plans")
      .then((res) => setPlans(res.plans))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useAutoRefresh(load);

  const openNew = () => { setEditing(null); reset({ color: "blue", popular: false }); setShowForm(true); };
  const openEdit = (p: Plan) => {
    setEditing(p);
    setValue("name", p.name);
    setValue("coverageAmount", p.coverage_amount);
    setValue("annualPremium", p.annual_premium);
    setValue("description", p.description);
    setValue("benefits", p.benefits.join(", "));
    setValue("color", p.color || "blue");
    setValue("popular", !!p.popular);
    setShowForm(true);
  };

  const onSubmit = async (data: PlanForm) => {
    const annualPremium = Number(data.annualPremium);
    const payload = {
      name: data.name,
      description: data.description,
      coverageAmount: Number(data.coverageAmount),
      // The policy is annual-only; the monthly figure is just the installment
      // (annual premium ÷ 12) used by the payment system.
      annualPremium,
      monthlyPremium: Math.round(annualPremium / 12),
      benefits: data.benefits.split(",").map((b) => b.trim()).filter(Boolean),
      color: data.color || "blue",
      popular: !!data.popular,
    };

    try {
      if (editing) {
        await apiFetch(`/api/admin/plans/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Plan updated!");
      } else {
        await apiFetch("/api/admin/plans", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Plan created!");
      }
      setShowForm(false);
      reset();
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deletePlan = async (id: number) => {
    try {
      await apiFetch(`/api/admin/plans/${id}`, { method: "DELETE" });
      toast.success("Plan archived");
      load();
    } catch (err: any) {
      toast.error(err.message);
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
        subtitle="Manage available insurance plans — 1-year policies, shown exactly as customers see them"
        action={
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm hover:from-purple-700 hover:to-blue-700 transition-all shadow-md">
            <Plus className="w-4 h-4" /> Add Plan
          </button>
        }
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, i) => {
          const gradient = colorMap[plan.color] || colorMap.blue;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative h-full flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                plan.status === "active" ? "border-gray-200 dark:border-gray-800" : "border-dashed border-gray-300 dark:border-gray-700 opacity-70"
              }`}
            >
              {!!plan.popular && (
                <div className="absolute top-0 left-0 right-0 flex justify-center z-10">
                  <div className={`px-4 py-1 text-xs font-semibold text-white bg-gradient-to-r ${gradient} rounded-b-lg`}>
                    <Star className="w-3 h-3 inline mr-1" />Most Popular
                  </div>
                </div>
              )}

              <div className={`p-5 bg-gradient-to-br ${gradient} ${plan.popular ? "pt-8" : ""}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
                      {plan.status === "active" ? "Plan" : "Archived plan"}
                    </p>
                    <h3 className="text-white text-xl mt-0.5">{plan.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(plan)}
                      title="Edit plan"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-white" />
                    </button>
                    {plan.status === "active" && (
                      <button
                        onClick={() => deletePlan(plan.id)}
                        title="Archive plan"
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-red-500/60 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                    <Shield className="w-8 h-8 text-white/60 ml-1" />
                  </div>
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

                <ul className="space-y-2">
                  {plan.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-white">{editing ? "Edit Plan" : "New Insurance Plan"}</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              {[
                { name: "name", label: "Plan Name", type: "text", placeholder: "e.g. Premium Elite" },
                { name: "coverageAmount", label: "Coverage Amount (MMK)", type: "number", placeholder: "50000000" },
                { name: "annualPremium", label: "Annual Premium (MMK)", type: "number", placeholder: "1350000" },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                  <input {...register(name as keyof PlanForm, { required: true })} type={type} placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                  {name === "annualPremium" && (
                    <p className="mt-1 text-xs text-gray-400">Policies last 1 year — customers pay this once or in 12 installments.</p>
                  )}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea {...register("description")} rows={2} placeholder="Plan description..."
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Benefits (comma-separated)</label>
                <input {...register("benefits")} placeholder="Outpatient, Emergency care, Surgery..."
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
                <p className="mt-1 text-xs text-gray-400">These become the claim types customers can file.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Card Color</label>
                  <select {...register("color")}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  >
                    <option value="blue">Blue</option>
                    <option value="teal">Teal</option>
                    <option value="purple">Purple</option>
                  </select>
                </div>
                <div className="flex-1 flex items-end pb-2.5">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input type="checkbox" {...register("popular")} className="w-4 h-4 rounded accent-purple-600" />
                    Mark as Most Popular
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm">
                  {editing ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
