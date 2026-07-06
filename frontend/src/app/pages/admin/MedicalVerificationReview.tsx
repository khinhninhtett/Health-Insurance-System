import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { HeartPulse, CheckCircle, XCircle, FileText, Clock } from "lucide-react";
import { apiFetch, API_BASE } from "../../utils/api";
import { getStatusColor } from "../../utils/helpers";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";

interface Verification {
  id: number;
  customer_name: string;
  customer_email: string;
  policy_number: string;
  plan_name: string;
  height_cm: number;
  weight_kg: number;
  bmi: string;
  blood_pressure: string;
  heart_rate: number;
  blood_group: string;
  has_chronic_disease: number;
  smoker: number;
  status: string;
  admin_note: string | null;
}

export default function MedicalVerificationReview() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Verification | null>(null);
  const [note, setNote] = useState("");
  const [deciding, setDeciding] = useState(false);

  const load = () => {
    setLoading(true);
    apiFetch(`/api/admin/medical-verifications${filter !== "all" ? `?status=${filter}` : ""}`)
      .then((res) => setVerifications(res.verifications))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const decide = async (decision: "approved" | "rejected") => {
    if (!selected) return;
    setDeciding(true);
    try {
      await apiFetch(`/api/admin/medical-verifications/${selected.id}/decision`, {
        method: "POST",
        body: JSON.stringify({ decision, note }),
      });
      toast.success(`Verification ${decision}.`);
      setSelected(null);
      setNote("");
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeciding(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Medical Verification" subtitle="Review customer medical submissions before they can proceed to payment" />

      <div className="flex gap-2 flex-wrap">
        {["pending", "approved", "rejected", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
              filter === f
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : verifications.length === 0 ? (
        <GlassCard className="p-12 text-center text-gray-400">
          <HeartPulse className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No {filter === "all" ? "" : filter} submissions</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {verifications.map((v, i) => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <HeartPulse className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{v.customer_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{v.plan_name} · {v.policy_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(v.status)}`}>{v.status}</span>
                  <button
                    onClick={() => setSelected(v)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Review
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-white">{selected.customer_name}'s Medical Verification</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{selected.customer_email}</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Height", `${selected.height_cm} cm`],
                  ["Weight", `${selected.weight_kg} kg`],
                  ["BMI", selected.bmi],
                  ["Blood Pressure", selected.blood_pressure],
                  ["Heart Rate", `${selected.heart_rate} bpm`],
                  ["Blood Group", selected.blood_group],
                  ["Chronic Disease", selected.has_chronic_disease ? "Yes" : "No"],
                  ["Smoker", selected.smoker ? "Yes" : "No"],
                ].map(([l, v]) => (
                  <div key={l} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-400">{l}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{v}</p>
                  </div>
                ))}
              </div>

              <a
                href={`${API_BASE}/api/admin/medical-verifications/${selected.id}/document`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  const token = localStorage.getItem("him_token");
                  fetch(`${API_BASE}/api/admin/medical-verifications/${selected.id}/document`, {
                    headers: { Authorization: `Bearer ${token}` },
                  })
                    .then((res) => res.blob())
                    .then((blob) => window.open(URL.createObjectURL(blob), "_blank"))
                    .catch(() => toast.error("Could not load medical record."));
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <FileText className="w-4 h-4" /> View medical record PDF
              </a>

              {selected.status === "pending" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Note (optional)</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      placeholder="Reason for your decision..."
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      disabled={deciding}
                      onClick={() => decide("rejected")}
                      className="flex-1 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      disabled={deciding}
                      onClick={() => decide("approved")}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" /> Already {selected.status}{selected.admin_note ? ` — "${selected.admin_note}"` : ""}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
