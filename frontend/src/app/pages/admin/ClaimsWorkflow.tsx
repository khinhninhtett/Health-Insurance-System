import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { FileText, CheckCircle, XCircle, AlertCircle, Eye, Hospital, User, Calendar, Hash, Wallet, Info, FileWarning, X } from "lucide-react";
import { apiFetch } from "../../utils/api";
import { useAuthenticatedImage } from "../../hooks/useAuthenticatedImage";
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
  description: string | null;
  document_path: string | null;
}

export default function ClaimsWorkflow() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Claim | null>(null);
  const [deciding, setDeciding] = useState(false);

  const load = () => {
    apiFetch("/api/admin/claims")
      .then((res) => setClaims(res.claims))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useAutoRefresh(load);

  const handleAction = async (id: number, action: "approved" | "rejected") => {
    setDeciding(true);
    try {
      await apiFetch(`/api/admin/claims/${id}/override`, { method: "POST", body: JSON.stringify({ decision: action }) });
      toast[action === "approved" ? "success" : "error"](`Claim ${action}!`);
      setSelected(null);
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeciding(false);
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
                    <button
                      onClick={() => setSelected(claim)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
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

      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selected.type}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Claim #{selected.id}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize shrink-0 ${getStatusColor(selected.status)}`}>
                {selected.status}
              </span>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <Wallet className="w-4 h-4" /> Claim Amount
                </div>
                <p className="text-2xl font-semibold">{formatCurrency(selected.amount)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    [User, "Customer", selected.customer_name],
                    [Hospital, "Hospital", selected.hospital_name || "—"],
                    [Hash, "Policy Number", selected.policy_number],
                    [Calendar, "Service Date", formatDate(selected.service_date)],
                  ] as [typeof User, string, string][]
                ).map(([Icon, l, v]) => (
                  <div key={l} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                      <Icon className="w-3.5 h-3.5" /> {l}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{v}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Supporting document</p>
                <ClaimDocument claimId={selected.id} documentPath={selected.document_path} />
              </div>

              {selected.description && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Info className="w-3.5 h-3.5" /> Description
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selected.description}</p>
                </div>
              )}

              {selected.reason && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/40">
                  <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 mb-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Review Note
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">{selected.reason}</p>
                </div>
              )}

              {selected.status === "pending" && (
                <div className="flex gap-3 pt-2">
                  <button
                    disabled={deciding}
                    onClick={() => handleAction(selected.id, "rejected")}
                    className="flex-1 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800 flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button
                    disabled={deciding}
                    onClick={() => handleAction(selected.id, "approved")}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 transition-opacity"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function ClaimDocument({ claimId, documentPath }: { claimId: number; documentPath: string | null }) {
  const isPdf = !!documentPath && documentPath.toLowerCase().endsWith(".pdf");
  const url = useAuthenticatedImage(documentPath ? `/api/admin/claims/${claimId}/document` : null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setViewerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerOpen]);

  if (!documentPath) {
    return (
      <div className="w-full h-32 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-1 text-gray-400">
        <FileWarning className="w-5 h-5" />
        <span className="text-xs">No document uploaded</span>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="w-full h-32 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isPdf ? (
          <button type="button" onClick={() => setViewerOpen(true)} title="View full size" className="block w-full cursor-zoom-in">
            <iframe src={url} title="Claim document" className="w-full h-64 pointer-events-none" />
          </button>
        ) : (
          <button type="button" onClick={() => setViewerOpen(true)} title="View full size" className="block w-full cursor-zoom-in">
            <img src={url} alt="Claim document" className="w-full max-h-64 object-contain" />
          </button>
        )}
      </div>

      {viewerOpen && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setViewerOpen(false)}
        >
          <button
            type="button"
            onClick={() => setViewerOpen(false)}
            aria-label="Close document view"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {isPdf ? (
            <motion.iframe
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              src={url}
              title="Claim document full view"
              className="w-full h-full max-w-4xl bg-white rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              src={url}
              alt="Claim document full view"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </motion.div>,
        document.body
      )}
    </>
  );
}
