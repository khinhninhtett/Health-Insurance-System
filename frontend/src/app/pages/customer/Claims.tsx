import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Plus, Upload, CheckCircle, Clock, XCircle, FileText, X, ArrowRight, AlertCircle } from "lucide-react";
import { apiFetch } from "../../utils/api";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import { formatCurrency, formatDate, getStatusColor } from "../../utils/helpers";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";

interface ClaimForm {
  type: string;
  hospitalName: string;
  serviceDate: string;
  amount: number;
  description: string;
}

interface Claim {
  id: number;
  type: string;
  hospital_name: string | null;
  service_date: string;
  amount: number;
  description: string;
  status: string;
  reason: string | null;
}

interface UserPlan {
  status: string;
  start_date: string | null;
}

const statusTimeline = (status: string) => [
  { label: "Submitted", done: true },
  { label: "Admin Review", done: status !== "pending" },
  { label: status === "rejected" ? "Rejected" : "Approved", done: status === "approved" || status === "rejected" },
];

export default function Claims() {
  const [myPlan, setMyPlan] = useState<UserPlan | null>(null);
  const [claimTypes, setClaimTypes] = useState<string[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<number | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClaimForm>();

  const load = () => {
    Promise.all([apiFetch("/api/plans/me"), apiFetch("/api/claims/me"), apiFetch("/api/claims/types")])
      .then(([planRes, claimsRes, typesRes]) => {
        setMyPlan(planRes.userPlan);
        setClaims(claimsRes.claims);
        setClaimTypes(typesRes.types);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useAutoRefresh(load);

  const onSubmit = async (data: ClaimForm) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", data.type);
      formData.append("hospitalName", data.hospitalName);
      formData.append("serviceDate", data.serviceDate);
      formData.append("amount", String(data.amount));
      formData.append("description", data.description);
      if (document) formData.append("document", document);

      const res = await apiFetch("/api/claims", { method: "POST", body: formData });
      toast.success(res.message);
      setShowForm(false);
      reset();
      setDocument(null);
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const canFileClaims = myPlan?.status === "active";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Claims Management"
        subtitle="Submit and track your insurance claims"
        action={
          canFileClaims ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm hover:from-blue-700 hover:to-teal-700 transition-all shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" /> New Claim
            </button>
          ) : undefined
        }
      />

      {!canFileClaims && (
        <GlassCard className="p-5 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">You need an active policy to file claims</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Complete your enrollment first.</p>
          </div>
          <Link to="/customer/plans" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline shrink-0">
            Go to plans <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </GlassCard>
      )}

      <div className="space-y-4">
        {claims.length > 0 ? claims.map((claim, i) => (
          <motion.div key={claim.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <GlassCard className="p-5 cursor-pointer hover:shadow-md transition-shadow" hover onClick={() => setSelectedClaim(selectedClaim === claim.id ? null : claim.id)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{claim.type}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{claim.hospital_name || "—"} · {formatDate(claim.service_date)}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{claim.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(claim.amount)}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>{claim.status}</span>
                </div>
              </div>

              {selectedClaim === claim.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  {claim.reason && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{claim.reason}</p>}
                  <div className="flex items-center gap-1">
                    {statusTimeline(claim.status).map((step, idx) => (
                      <div key={idx} className="flex items-center gap-1 flex-1">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.done ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}>
                            {step.done
                              ? (step.label === "Rejected" ? <XCircle className="w-3.5 h-3.5 text-white" /> : <CheckCircle className="w-3.5 h-3.5 text-white" />)
                              : <Clock className="w-3.5 h-3.5 text-gray-400" />}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center whitespace-nowrap">{step.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>
        )) : (
          <GlassCard className="p-12">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No claims yet</p>
              <p className="text-sm mt-1">Submit your first claim when you need medical reimbursement</p>
            </div>
          </GlassCard>
        )}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-white">Submit New Claim</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Claim Type</label>
                <select {...register("type", { required: true })} defaultValue="" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                  <option value="" disabled>Select a covered benefit...</option>
                  {claimTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <p className="text-xs text-red-500 mt-1">Please select a claim type.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hospital</label>
                <input
                  {...register("hospitalName", { required: true })}
                  placeholder="e.g. Yangon General Hospital"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              {[
                { name: "serviceDate", label: "Date of Service", type: "date" },
                { name: "amount", label: "Claim Amount (MMK)", type: "number", placeholder: "150000" },
              ].map(({ name, label, placeholder, type }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                  <input {...register(name as keyof ClaimForm, { required: true })} type={type} placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea {...register("description", { required: true })} rows={2} placeholder="Brief description of the medical service..."
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Upload Documents</label>
                <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 cursor-pointer hover:border-blue-400 transition-colors">
                  <Upload className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{document ? document.name : "Upload receipts, reports, etc."}</span>
                  <input type="file" accept="image/*" onChange={(e) => setDocument(e.target.files?.[0] ?? null)} className="hidden" />
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm hover:from-blue-700 hover:to-teal-700 transition-all disabled:opacity-60">
                  {submitting ? "Submitting..." : "Submit Claim"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
