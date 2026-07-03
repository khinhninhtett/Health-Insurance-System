import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { Calculator, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { insurancePlans } from "../../data/mockData";
import { formatCurrency, calculateBMI, getBMICategory, getRiskLevel } from "../../utils/helpers";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";

interface CalcForm {
  age: number;
  heightCm: number;
  weightKg: number;
  planId: string;
  hasChronicDisease: boolean;
  smoker: boolean;
}

interface CalcResult {
  bmi: number;
  bmiCategory: ReturnType<typeof getBMICategory>;
  riskLevel: ReturnType<typeof getRiskLevel>;
  basePremium: number;
  monthlyPremium: number;
  annualPremium: number;
  planName: string;
}

export default function PremiumCalculation() {
  const [result, setResult] = useState<CalcResult | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<CalcForm>();

  const onSubmit = (data: CalcForm) => {
    const bmi = calculateBMI(Number(data.heightCm), Number(data.weightKg));
    const bmiCategory = getBMICategory(bmi);
    const riskLevel = getRiskLevel(bmi, Number(data.age), data.hasChronicDisease);
    const plan = insurancePlans.find((p) => p.id === data.planId) || insurancePlans[1];
    let multiplier = riskLevel.multiplier;
    if (data.smoker) multiplier *= 1.2;
    const monthlyPremium = Math.round(plan.monthlyPremium * multiplier);
    const annualPremium = monthlyPremium * 12 - Math.round(monthlyPremium * 0.5);
    setResult({ bmi, bmiCategory, riskLevel, basePremium: plan.monthlyPremium, monthlyPremium, annualPremium, planName: plan.name });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Premium Calculator" subtitle="Calculate your personalized insurance premium" />

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Calculator className="w-5 h-5 text-blue-500" />
            <h3 className="text-gray-900 dark:text-white">Your Information</h3>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Insurance Plan</label>
              <select
                {...register("planId", { required: true })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                {insurancePlans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { name: "age", label: "Age", placeholder: "35" },
                { name: "heightCm", label: "Height (cm)", placeholder: "170" },
                { name: "weightKg", label: "Weight (kg)", placeholder: "70" },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                  <input
                    {...register(name as keyof CalcForm, { required: true, min: 1 })}
                    type="number"
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  {...register("hasChronicDisease")}
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Pre-existing / Chronic Disease</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  {...register("smoker")}
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Current Smoker</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white font-medium hover:from-blue-700 hover:to-teal-700 transition-all shadow-md shadow-blue-500/20"
            >
              <Calculator className="w-4 h-4" /> Calculate Premium
            </button>
          </form>
        </GlassCard>

        {/* Result */}
        {result ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <GlassCard className="p-6">
              <h3 className="text-gray-900 dark:text-white mb-4">Calculation Results</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-400 mb-1">BMI</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{result.bmi}</p>
                  <p className={`text-xs font-medium ${result.bmiCategory.color}`}>{result.bmiCategory.label}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Risk Level</p>
                  <p className={`text-xl font-bold ${result.riskLevel.color}`}>{result.riskLevel.level}</p>
                  <p className="text-xs text-gray-400">{result.riskLevel.multiplier}x multiplier</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 border border-blue-200 dark:border-blue-800 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Plan</span>
                  <span className="font-medium text-gray-900 dark:text-white">{result.planName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Base Premium</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(result.basePremium)}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 dark:border-blue-700 pt-3">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Monthly Premium</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(result.monthlyPremium)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Annual (save ~0.5 month)</span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400">{formatCurrency(result.annualPremium)}</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Note</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Final premium may vary after medical verification. This is an estimated calculation based on the information provided.</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <GlassCard className="p-6">
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-12">
              <TrendingUp className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Fill in your details and click Calculate to see your premium estimate</p>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
