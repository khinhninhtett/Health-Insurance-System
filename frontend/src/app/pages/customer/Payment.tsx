import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { motion } from "motion/react";
import { CreditCard, Upload, CheckCircle, XCircle, ArrowRight, Clock } from "lucide-react";
import { apiFetch } from "../../utils/api";
import { formatCurrency, formatDate, getStatusColor } from "../../utils/helpers";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";

const paymentMethods = [
  { id: "kbz", name: "KBZ Pay", logo: "💰", instructions: "Transfer to: KBZ Pay 09-XXXX-XXXX\nRef: Your Policy Number" },
  { id: "wave", name: "Wave Pay", logo: "🌊", instructions: "Transfer to: Wave Pay 09-XXXX-XXXX\nRef: Your Policy Number" },
  { id: "mpu", name: "MPU", logo: "💳", instructions: "Swipe at any MPU terminal or online payment" },
  { id: "bank", name: "Bank Transfer", logo: "🏦", instructions: "Account: CB Bank 0123456789\nName: HealthInsure Co. Ltd." },
];

interface UserPlan {
  status: string;
  plan_name: string;
  monthly_premium: number;
  annual_premium: number;
  policy_number: string;
}

interface PaymentRecord {
  id: number;
  method: string;
  transaction_id: string;
  amount: number;
  billing_cycle: "monthly" | "yearly";
  status: string;
  reason: string | null;
  createdAt: string;
}

interface PaymentForm {
  transactionId: string;
  amount: number;
}

export default function Payment() {
  const [myPlan, setMyPlan] = useState<UserPlan | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [selectedMethod, setSelectedMethod] = useState("kbz");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<PaymentRecord | null>(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PaymentForm>();

  const load = () => {
    Promise.all([apiFetch("/api/plans/me"), apiFetch("/api/payments/me")])
      .then(([planRes, payRes]) => {
        setMyPlan(planRes.userPlan);
        setPayments(payRes.payments);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    if (!myPlan) return;
    setValue("amount", billingCycle === "yearly" ? myPlan.annual_premium : myPlan.monthly_premium);
  }, [billingCycle, myPlan, setValue]);

  const onSubmit = async (data: PaymentForm) => {
    if (!receipt) {
      toast.error("Please upload your payment receipt.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("method", selectedMethod);
      formData.append("transactionId", data.transactionId);
      formData.append("amount", String(data.amount));
      formData.append("billingCycle", billingCycle);
      formData.append("receipt", receipt);

      const res = await apiFetch("/api/payments", { method: "POST", body: formData });
      setLastResult(res.payment);
      toast.success(res.message || "Payment submitted. Awaiting admin approval.");
      reset();
      setReceipt(null);
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const method = paymentMethods.find((m) => m.id === selectedMethod);
  const expectedAmount = myPlan ? (billingCycle === "yearly" ? myPlan.annual_premium : myPlan.monthly_premium) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!myPlan || ["rejected", "expired"].includes(myPlan.status) || myPlan.status === "pending_medical") {
    return (
      <div className="space-y-6">
        <PageHeader title="Payment" subtitle="Submit your insurance premium payment" />
        <GlassCard className="p-12 text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            {!myPlan || ["rejected", "expired"].includes(myPlan.status)
              ? "Select a plan first"
              : "Complete medical verification first"}
          </p>
          <Link
            to={!myPlan || ["rejected", "expired"].includes(myPlan.status) ? "/customer/plans" : "/customer/medical-verification"}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Link>
        </GlassCard>
      </div>
    );
  }

  if (myPlan.status === "active") {
    return (
      <div className="space-y-6">
        <PageHeader title="Payment" subtitle="Submit your insurance premium payment" />
        <GlassCard className="p-12 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
          <p className="text-gray-900 dark:text-white font-medium">Your policy is active</p>
          <p className="text-sm text-gray-400 mt-1">Policy {myPlan.policy_number} — no payment due right now.</p>
          <Link to="/customer/insurance-card" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm">
            View insurance card <ArrowRight className="w-4 h-4" />
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Payment" subtitle={`Pay ${formatCurrency(expectedAmount)} to activate your ${myPlan.plan_name} policy`} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-gray-900 dark:text-white mb-4">Billing Cycle</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  billingCycle === "monthly"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900"
                }`}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">Monthly</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatCurrency(myPlan.monthly_premium)} / month</p>
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  billingCycle === "yearly"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900"
                }`}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">Yearly</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatCurrency(myPlan.annual_premium)} / year</p>
              </button>
            </div>
          </GlassCard>

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
              <motion.div key={selectedMethod} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Payment Instructions</p>
                <p className="text-sm text-blue-600 dark:text-blue-300 whitespace-pre-line">{method.instructions}</p>
              </motion.div>
            )}
          </GlassCard>

          {lastResult ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <GlassCard className="p-6">
                <div className="text-center py-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    lastResult.status === "approved" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                    lastResult.status === "rejected" ? "bg-red-100 dark:bg-red-900/30" :
                    "bg-amber-100 dark:bg-amber-900/30"
                  }`}>
                    {lastResult.status === "approved" ? (
                      <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    ) : lastResult.status === "rejected" ? (
                      <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    ) : (
                      <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <h3 className="text-gray-900 dark:text-white mb-2">
                    {lastResult.status === "approved" ? "Payment Confirmed!" : lastResult.status === "rejected" ? "Payment Rejected" : "Awaiting Admin Approval"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{lastResult.reason}</p>
                  {lastResult.status === "rejected" && (
                    <button onClick={() => setLastResult(null)} className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">Try another payment</button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <GlassCard className="p-6">
              <h3 className="text-gray-900 dark:text-white mb-4">Submit Payment</h3>
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
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  <p className="mt-1 text-xs text-gray-400">Required ({billingCycle}): {formatCurrency(expectedAmount)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Receipt Screenshot</label>
                  <label
                    className={`flex flex-col items-center gap-2 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      receipt ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-600"
                    }`}
                  >
                    {receipt ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{receipt.name}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload receipt</p>
                        <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} className="hidden" />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white font-medium hover:from-blue-700 hover:to-teal-700 disabled:opacity-60 transition-all shadow-md shadow-blue-500/20"
                >
                  {submitting ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                  Submit Payment
                </button>
              </form>
            </GlassCard>
          )}
        </div>

        {/* Payment History */}
        <GlassCard className="p-6">
          <h3 className="text-gray-900 dark:text-white mb-4">Payment History</h3>
          <div className="space-y-3">
            {payments.length ? payments.map((p) => (
              <div key={p.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{p.method.toUpperCase()}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>{p.status}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(p.createdAt)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{p.transaction_id}</p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(p.amount)}</p>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No payments yet</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
