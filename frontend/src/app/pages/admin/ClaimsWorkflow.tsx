import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { apiFetch } from "../../utils/api";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import { formatCurrency, formatDate, getStatusColor } from "../../utils/helpers";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";

interface Claim {
  id: number;
  type: string;
  customer_name: string;
  hospital_name: string | null;
  policy_number: string;
  service_date: string;
  amount: number;
  status: string;
  reason: string | null;
}

export default function ClaimsWorkflow() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () => {
    apiFetch("/api/admin/claims")
      .then((res) => setClaims(res.claims))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useAutoRefresh(load);

  const handleAction = async (id: number, action: "approved" | "rejected") => {
    try {
      await apiFetch(`/api/admin/claims/${id}/override`, { method: "POST", body: JSON.stringify({ decision: action }) });
      toast[action === "approved" ? "success" : "error"](`Claim ${action}!`);
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

  const filtered = filter === "all" ? claims : claims.filter((c) => c.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader title="Claims Workflow" subtitle="Review submitted claims and approve or reject them" />

      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
              filter === f
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            {f === "all" ? `All (${claims.length})` : `${f} (${claims.filter((c) => c.status === f).length})`}
          </button>
        ))}
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {["Claim", "Customer", "Hospital", "Date", "Amount", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((claim, i) => (
                <motion.tr key={claim.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{claim.type}</p>
                        <p className="text-xs text-gray-400">{claim.policy_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{claim.customer_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{claim.hospital_name || "—"}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(claim.service_date)}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(claim.amount)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>{claim.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(claim.id, "approved")} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button onClick={() => handleAction(claim.id, "rejected")} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs border border-red-200 dark:border-red-800">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <AlertCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No {filter === "all" ? "" : filter} claims found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
