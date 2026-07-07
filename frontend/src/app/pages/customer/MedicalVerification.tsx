import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { HeartPulse, UploadCloud, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { apiFetch } from "../../utils/api";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface FormValues {
  age: number;
  heightCm: number;
  weightKg: number;
  bloodPressure: string;
  heartRate: number;
  bloodGroup: string;
  hasChronicDisease: boolean;
  smoker: boolean;
}

interface UserPlan {
  status: string;
  plan_name: string;
}

interface Verification {
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
}

export default function MedicalVerification() {
  const [myPlan, setMyPlan] = useState<UserPlan | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const load = () => {
    Promise.all([apiFetch("/api/plans/me"), apiFetch("/api/medical-verification/me")])
      .then(([planRes, verRes]) => {
        setMyPlan(planRes.userPlan);
        setVerification(verRes.verification);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (data: FormValues) => {
    if (!file) {
      toast.error("Please attach your medical record as a PDF.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, String(value)));
      formData.append("medicalRecord", file);

      await apiFetch("/api/medical-verification", { method: "POST", body: formData });
      toast.success("Submitted! An admin will review your medical verification shortly.");
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

  if (!myPlan || myPlan.status === "rejected" || myPlan.status === "expired") {
    return (
      <div className="space-y-6">
        <PageHeader title="Medical Verification" subtitle="Part of the insurance purchase process" />
        <GlassCard className="p-12 text-center">
          <HeartPulse className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">Select a plan first</p>
          <p className="text-sm text-gray-400 mt-1">
            {myPlan?.status === "rejected"
              ? "Your previous application was rejected. Select a plan to try again."
              : "You need to select an insurance plan before submitting medical verification."}
          </p>
          <Link to="/customer/plans" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm">
            Browse plans <ArrowRight className="w-4 h-4" />
          </Link>
        </GlassCard>
      </div>
    );
  }

  if (myPlan.status === "pending_payment" || myPlan.status === "active") {
    return (
      <div className="space-y-6">
        <PageHeader title="Medical Verification" subtitle="Part of the insurance purchase process" />
        <GlassCard className="p-12 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
          <p className="text-gray-900 dark:text-white font-medium">Medical verification approved</p>
          <p className="text-sm text-gray-400 mt-1">You're clear to continue with your {myPlan.plan_name} enrollment.</p>
          <button
            onClick={() => navigate(myPlan.status === "active" ? "/customer/insurance-card" : "/customer/payment")}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm"
          >
            {myPlan.status === "active" ? "View insurance card" : "Continue to payment"} <ArrowRight className="w-4 h-4" />
          </button>
        </GlassCard>
      </div>
    );
  }

  if (verification?.status === "pending") {
    return (
      <div className="space-y-6">
        <PageHeader title="Medical Verification" subtitle="Part of the insurance purchase process" />
        <GlassCard className="p-12 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-amber-500" />
          <p className="text-gray-900 dark:text-white font-medium">Awaiting admin review</p>
          <p className="text-sm text-gray-400 mt-1">We'll let you know once your submission has been reviewed.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Medical Verification" subtitle={`Complete this step to continue enrolling in ${myPlan.plan_name}`} />

      {verification?.status === "rejected" && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Your previous submission was rejected</p>
            {verification.admin_note && <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{verification.admin_note}</p>}
            <p className="text-xs text-red-500 mt-1">Please review your details and resubmit.</p>
          </div>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-6 max-w-2xl">
          <div className="flex items-center gap-2 mb-5">
            <HeartPulse className="w-5 h-5 text-blue-500" />
            <h3 className="text-gray-900 dark:text-white">Your Medical Information</h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Age</label>
                <input
                  {...register("age", { required: true, min: 1, max: 120 })}
                  type="number"
                  placeholder="35"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                {errors.age && <p className="mt-1 text-xs text-red-500">Enter a valid age</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Height (cm)</label>
                <input
                  {...register("heightCm", { required: true, min: 50, max: 250 })}
                  type="number"
                  placeholder="170"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                {errors.heightCm && <p className="mt-1 text-xs text-red-500">Enter a valid height</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Weight (kg)</label>
                <input
                  {...register("weightKg", { required: true, min: 20, max: 300 })}
                  type="number"
                  placeholder="70"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                {errors.weightKg && <p className="mt-1 text-xs text-red-500">Enter a valid weight</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Blood Pressure</label>
                <input
                  {...register("bloodPressure", { required: true })}
                  placeholder="120/80"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Heart Rate (bpm)</label>
                <input
                  {...register("heartRate", { required: true, min: 30, max: 220 })}
                  type="number"
                  placeholder="72"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                {errors.heartRate && <p className="mt-1 text-xs text-red-500">Enter a valid heart rate</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Blood Group</label>
              <select
                {...register("bloodGroup", { required: true })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input {...register("hasChronicDisease")} type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Pre-existing / Chronic Disease</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input {...register("smoker")} type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Current Smoker</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Medical Record (PDF)</label>
              <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 cursor-pointer hover:border-blue-400 transition-colors">
                <UploadCloud className="w-5 h-5 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {file ? file.name : "Choose a PDF file"}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white font-medium hover:from-blue-700 hover:to-teal-700 disabled:opacity-60 transition-all shadow-md shadow-blue-500/20"
            >
              {submitting ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <>Submit for review <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
