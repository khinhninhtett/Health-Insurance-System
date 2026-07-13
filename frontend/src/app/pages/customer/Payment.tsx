import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { motion } from "motion/react";
import { CreditCard, Upload, CheckCircle, XCircle, ArrowRight, Clock, CalendarDays, AlertTriangle } from "lucide-react";
import { apiFetch } from "../../utils/api";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import { formatCurrency, formatDate, getStatusColor } from "../../utils/helpers";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";
import kpayLogo from "../../../assets/payments/kbzpay.png";
import wavepayLogo from "../../../assets/payments/wavepay.png";
import ayapayLogo from "../../../assets/payments/ayapay.png";
import cbpayLogo from "../../../assets/payments/cbpay.jpg";

const paymentMethods = [
  { id: "kpay", name: "KBZPay", logo: kpayLogo, instructions: "Transfer to: KBZPay 09-XXXX-XXXX\nRef: Your Policy Number" },
  { id: "wavepay", name: "WavePay", logo: wavepayLogo, instructions: "Transfer to: WavePay 09-XXXX-XXXX\nRef: Your Policy Number" },
  { id: "ayapay", name: "AYA Pay", logo: ayapayLogo, instructions: "Transfer to: AYA Pay 09-XXXX-XXXX\nRef: Your Policy Number" },
  { id: "cbpay", name: "CB Pay", logo: cbpayLogo, instructions: "Transfer to: CB Pay 09-XXXX-XXXX\nRef: Your Policy Number" },
];

interface UserPlan {
  status: string;
  plan_name: string;
  monthly_premium: number;
  annual_premium: number;
  policy_number: string;
  billing_cycle: "monthly" | "yearly" | null;
  end_date: string | null;
}

interface Installment {
  id: number;
  installment_no: number;
  amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue";
}

interface Schedule {
  status: string;
  billingCycle: "monthly" | "yearly" | null;
  startDate: string | null;
  endDate: string | null;
  installmentAmount: number;
  installments: Installment[];
  nextDue: Installment | null;
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
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [selectedMethod, setSelectedMethod] = useState("kpay");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<PaymentRecord | null>(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PaymentForm>();

  const load = () => {
    Promise.all([apiFetch("/api/plans/me"), apiFetch("/api/payments/me"), apiFetch("/api/payments/schedule")])
      .then(([planRes, payRes, schedRes]) => {
        setMyPlan(planRes.userPlan);
        setPayments(payRes.payments);
        setSchedule(schedRes.schedule);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useAutoRefresh(load);

  const isPendingPayment = myPlan?.status === "pending_payment";
  const isActiveLike = myPlan ? ["active", "suspended"].includes(myPlan.status) : false;
  const installmentAmount = schedule?.installmentAmount ?? (myPlan ? Math.round(myPlan.annual_premium / 12) : 0);
  const nextDue = isActiveLike && myPlan?.billing_cycle === "monthly" ? schedule?.nextDue ?? null : null;

  // What this payment is for and how much is expected.
  const expectedAmount = isPendingPayment
    ? (billingCycle === "yearly" ? myPlan!.annual_premium : installmentAmount)
    : nextDue
      ? Number(nextDue.amount)
      : 0;

  useEffect(() => {
    if (expectedAmount) setValue("amount", expectedAmount);
  }, [expectedAmount, setValue]);

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
      if (isPendingPayment) formData.append("billingCycle", billingCycle);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!myPlan || ["rejected", "expired"].includes(myPlan.status) || myPlan.status === "pending_medical") {
    const needsPlan = !myPlan || ["rejected", "expired"].includes(myPlan.status);
    return (
      <div className="space-y-6">
        <PageHeader title="Payment" subtitle="Submit your insurance premium payment" />
        <GlassCard className="p-12 text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            {myPlan?.status === "expired"
              ? "Your policy year has ended — renew to restore coverage"
              : needsPlan
                ? "Select a plan first"
                : "Complete medical verification first"}
          </p>
          <Link
            to={needsPlan ? "/customer/plans" : "/customer/medical-verification"}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm"
          >
            {myPlan?.status === "expired" ? "Renew now" : "Continue"} <ArrowRight className="w-4 h-4" />
          </Link>
        </GlassCard>
      </div>
    );
  }

  // Active with nothing to pay: annual payers, or installment payers fully paid up.
  if (isActiveLike && !nextDue) {
    return (
      <div className="space-y-6">
        <PageHeader title="Payment" subtitle="Submit your insurance premium payment" />
        <GlassCard className="p-12 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
          <p className="text-gray-900 dark:text-white font-medium">Your policy is active — no payment due</p>
          <p className="text-sm text-gray-400 mt-1">
            Policy {myPlan.policy_number}
            {myPlan.end_date ? ` · covered until ${formatDate(myPlan.end_date)}` : ""}
            {myPlan.billing_cycle === "yearly" ? " · annual premium fully paid" : " · all installments paid"}
          </p>
          <p className="text-xs text-gray-400 mt-2">We'll remind you before your policy year ends so you can renew.</p>
          <Link to="/customer/insurance-card" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm">
            View insurance card <ArrowRight className="w-4 h-4" />
          </Link>
        </GlassCard>
      </div>
    );
  }

  const isOverdue = nextDue?.status === "overdue";
  const headerSubtitle = isPendingPayment
    ? `Pay ${formatCurrency(expectedAmount)} to activate your 1-year ${myPlan.plan_name} policy`
    : `Installment #${nextDue?.installment_no} of 12 — ${formatCurrency(expectedAmount)} due ${nextDue ? formatDate(nextDue.due_date) : ""}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Payment" subtitle={headerSubtitle} />

      {myPlan.status === "suspended" && (
        <GlassCard className="p-5 flex items-center gap-3 border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Your policy is suspended due to overdue installments</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pay the overdue installment(s) below to reinstate your coverage.</p>
          </div>
        </GlassCard>
      )}

      {!isPendingPayment && isOverdue && myPlan.status !== "suspended" && (
        <GlassCard className="p-5 flex items-center gap-3 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">This installment is overdue</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pay now to avoid your policy being suspended after the grace period.</p>
          </div>
        </GlassCard>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isPendingPayment && (
            <GlassCard className="p-6">
              <h3 className="text-gray-900 dark:text-white mb-1">Payment Method</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Every policy covers you for 1 full year — choose how you'd like to pay the annual premium.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    billingCycle === "yearly"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Annual Payment</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatCurrency(myPlan.annual_premium)} once</p>
                  <p className="text-xs text-gray-400 mt-1">Pay in full — nothing more due this policy year.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    billingCycle === "monthly"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Monthly Installment</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatCurrency(installmentAmount)} × 12 months</p>
                  <p className="text-xs text-gray-400 mt-1">Same 1-year coverage, annual premium split into 12.</p>
                </button>
              </div>
            </GlassCard>
          )}

          {!isPendingPayment && schedule && schedule.installments.length > 0 && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-4 h-4 text-blue-500" />
                <h3 className="text-gray-900 dark:text-white">Installment Schedule</h3>
                <span className="text-xs text-gray-400 ml-auto">
                  {schedule.installments.filter((i) => i.status === "paid").length} of 12 paid
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {schedule.installments.map((inst) => (
                  <div
                    key={inst.id}
                    className={`p-3 rounded-xl border text-left ${
                      inst.id === nextDue?.id
                        ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">#{inst.installment_no}</p>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(inst.status)}`}>{inst.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(inst.due_date)}</p>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(inst.amount)}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

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
                  <img src={m.logo} alt={`${m.name} logo`} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
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
              <h3 className="text-gray-900 dark:text-white mb-4">
                {isPendingPayment ? "Submit Payment" : `Pay Installment #${nextDue?.installment_no}`}
              </h3>
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
                  <p className="mt-1 text-xs text-gray-400">
                    Required{isPendingPayment ? ` (${billingCycle === "yearly" ? "annual payment" : "first installment"})` : ""}: {formatCurrency(expectedAmount)}
                  </p>
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
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{paymentMethods.find((m) => m.id === p.method)?.name ?? p.method.toUpperCase()}</span>
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
