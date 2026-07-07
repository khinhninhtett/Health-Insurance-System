import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Plus, Edit2, Trash2, Shield, X, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { apiFetch } from "../../utils/api";
import { formatCurrency } from "../../utils/helpers";
import GlassCard from "../../components/shared/GlassCard";
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
  status: string;
}

interface PlanForm {
  name: string;
  coverageAmount: number;
  monthlyPremium: number;
  description: string;
  benefits: string;
}

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

  const openNew = () => { setEditing(null); reset(); setShowForm(true); };
  const openEdit = (p: Plan) => {
    setEditing(p);
    setValue("name", p.name);
    setValue("coverageAmount", p.coverage_amount);
    setValue("monthlyPremium", p.monthly_premium);
    setValue("description", p.description);
    setValue("benefits", p.benefits.join(", "));
    setShowForm(true);
  };

  const onSubmit = async (data: PlanForm) => {
    const payload = {
      name: data.name,
      description: data.description,
      coverageAmount: Number(data.coverageAmount),
      monthlyPremium: Number(data.monthlyPremium),
      annualPremium: Number(data.monthlyPremium) * 11,
      benefits: data.benefits.split(",").map((b) => b.trim()).filter(Boolean),
      color: editing?.status === "archived" ? "blue" : "blue",
      popular: false,
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
        subtitle="Manage available insurance plans"
        action={
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm hover:from-purple-700 hover:to-blue-700 transition-all shadow-md">
            <Plus className="w-4 h-4" /> Add Plan
          </button>
        }
      />

      <div className="grid md:grid-cols-3 gap-5">
        {plans.map((plan, i) => (
          <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassCard className="p-5" hover>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{plan.name}</p>
                    <span className={`text-xs ${plan.status === "active" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`}>
                      ● {plan.status === "active" ? "Active" : "Archived"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(plan)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  {plan.status === "active" && (
                    <button onClick={() => deletePlan(plan.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Coverage</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(plan.coverage_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Monthly</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(plan.monthly_premium)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">{plan.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {plan.benefits.slice(0, 2).map((b) => (
                  <span key={b} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs">
                    <CheckCircle className="w-3 h-3" />{b}
                  </span>
                ))}
                {plan.benefits.length > 2 && <span className="text-xs text-gray-400">+{plan.benefits.length - 2} more</span>}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
                { name: "monthlyPremium", label: "Monthly Premium (MMK)", type: "number", placeholder: "120000" },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                  <input {...register(name as keyof PlanForm, { required: true })} type={type} placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
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
