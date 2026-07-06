import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle, XCircle, Eye, CreditCard } from "lucide-react";
import { apiFetch } from "../../utils/api";
import { formatCurrency, formatDate, getStatusColor } from "../../utils/helpers";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";

interface Payment {
  id: number;
  customer_name: string;
  plan_name: string;
  amount: number;
  billing_cycle: string;
  method: string;
  transaction_id: string;
  status: string;
  reason: string | null;
  createdAt: string;
}

export default function PaymentVerification() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Payment | null>(null);

  const load = () => {
    apiFetch("/api/admin/payments")
      .then((res) => setPayments(res.payments))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAction = async (id: number, action: "approved" | "rejected") => {
    try {
      await apiFetch(`/api/admin/payments/${id}/override`, { method: "POST", body: JSON.stringify({ decision: action }) });
      toast[action === "approved" ? "success" : "error"](`Payment ${action}!`);
      setSelected(null);
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

  const pending = payments.filter((p) => p.status === "pending");

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Verification" subtitle={`${pending.length} payments awaiting your review — a policy only activates once you approve its payment`} />

      <div className="grid lg:grid-cols-3 gap-4 mb-2">
        {[
          { label: "Pending", value: pending.length, color: "amber" },
          { label: "Approved", value: payments.filter((p) => p.status === "approved").length, color: "emerald" },
          { label: "Rejected", value: payments.filter((p) => p.status === "rejected").length, color: "red" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-4 border bg-${color}-50 dark:bg-${color}-900/20 border-${color}-200 dark:border-${color}-800`}>
            <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
            <p className={`text-sm text-${color}-600 dark:text-${color}-400`}>{label}</p>
          </div>
        ))}
      </div>

      <GlassCard className="p-6">
        <h3 className="text-gray-900 dark:text-white mb-4">All Payments</h3>
        {payments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No payments yet</p>
        ) : (
          <div className="space-y-3">
            {payments.map((pay, i) => (
              <motion.div key={pay.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{pay.customer_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{pay.plan_name} · {pay.method} · {pay.billing_cycle}</p>
                    <p className="text-xs text-gray-400">{formatDate(pay.createdAt)} · {pay.transaction_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(pay.amount)}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pay.status)}`}>{pay.status}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelected(pay)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-colors">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => handleAction(pay.id, "approved")} className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleAction(pay.id, "rejected")} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-white">Payment Details</h3>
            </div>
            <div className="p-5 space-y-3">
              {[
                ["Customer", selected.customer_name],
                ["Plan", selected.plan_name],
                ["Amount", formatCurrency(selected.amount)],
                ["Billing Cycle", selected.billing_cycle],
                ["Method", selected.method],
                ["Transaction ID", selected.transaction_id],
                ["Date", formatDate(selected.createdAt)],
                ["Reason", selected.reason || "—"],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{l}</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right max-w-[60%]">{v}</span>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={() => handleAction(selected.id, "rejected")} className="flex-1 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200">Reject</button>
                <button onClick={() => handleAction(selected.id, "approved")} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm">Approve</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
