import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { CreditCard, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/helpers";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";

const paymentMethods = [
  { id: "kbz", name: "KBZ Pay", logo: "💰", instructions: "Transfer to: KBZ Pay 09-XXXX-XXXX\nRef: Your Token Number" },
  { id: "wave", name: "Wave Pay", logo: "🌊", instructions: "Transfer to: Wave Pay 09-XXXX-XXXX\nRef: Your Token Number" },
  { id: "mpu", name: "MPU", logo: "💳", instructions: "Swipe at any MPU terminal or online payment" },
  { id: "bank", name: "Bank Transfer", logo: "🏦", instructions: "Account: CB Bank 0123456789\nName: HealthInsure Co. Ltd." },
];

const paymentHistory = [
  { id: "ph-001", date: "2024-01-30", method: "KBZ Pay", amount: 620000, status: "approved", txnId: "KBZ202401301234", plan: "Standard Plus" },
];

interface PaymentForm {
  method: string;
  transactionId: string;
  amount: number;
}

export default function Payment() {
  const [selectedMethod, setSelectedMethod] = useState("kbz");
  const [uploaded, setUploaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentForm>();

  const onSubmit = async (data: PaymentForm) => {
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    toast.success("Payment receipt submitted! Awaiting verification.");
  };

  const method = paymentMethods.find((m) => m.id === selectedMethod);

  return (
    <div className="space-y-6">
      <PageHeader title="Payment" subtitle="Submit your insurance premium payment" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Methods */}
          <GlassCard className="p-6">
            <h3 className="text-gray-900 dark:text-white mb-4">Select Payment Method</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === m.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900"
                  }`}
                >
                  <span className="text-2xl">{m.logo}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{m.name}</span>
                </button>
              ))}
            </div>

            {method && (
              <motion.div
                key={selectedMethod}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              >
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Payment Instructions</p>
                <p className="text-sm text-blue-600 dark:text-blue-300 whitespace-pre-line">{method.instructions}</p>
              </motion.div>
            )}
          </GlassCard>

          {/* Upload Receipt */}
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <GlassCard className="p-6">
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-gray-900 dark:text-white mb-2">Payment Submitted!</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your payment receipt is under review. You'll be notified once approved.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">Submit another payment</button>
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <GlassCard className="p-6">
              <h3 className="text-gray-900 dark:text-white mb-4">Upload Payment Receipt</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Transaction ID</label>
                  <input
                    {...register("transactionId", { required: "Transaction ID is required" })}
                    placeholder="e.g. KBZ202405011234"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  {errors.transactionId && <p className="mt-1 text-xs text-red-500">{errors.transactionId.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount Paid (MMK)</label>
                  <input
                    {...register("amount", { required: "Amount is required", min: 1 })}
                    type="number"
                    placeholder="620000"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Receipt Screenshot</label>
                  <div
                    onClick={() => { setUploaded(true); toast.success("Receipt uploaded!"); }}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      uploaded
                        ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-600"
                    }`}
                  >
                    {uploaded ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Receipt uploaded!</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload receipt</p>
                        <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white font-medium hover:from-blue-700 hover:to-teal-700 transition-all shadow-md shadow-blue-500/20"
                >
                  <Upload className="w-4 h-4" /> Submit Payment
                </button>
              </form>
            </GlassCard>
          )}
        </div>

        {/* Payment History */}
        <GlassCard className="p-6">
          <h3 className="text-gray-900 dark:text-white mb-4">Payment History</h3>
          <div className="space-y-3">
            {paymentHistory.map((p) => (
              <div key={p.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{p.plan}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(p.date)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{p.method} · {p.txnId}</p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(p.amount)}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
