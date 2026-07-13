import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Shield, FileText, Activity, CheckCircle, Clock, AlertCircle, CreditCard, BadgeCheck, ArrowRight, ShieldAlert, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAuthenticatedImage } from "../../hooks/useAuthenticatedImage";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import { apiFetch } from "../../utils/api";
import { formatCurrency, formatDate, getStatusColor } from "../../utils/helpers";
import StatCard from "../../components/shared/StatCard";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";

interface UserPlan {
  status: string;
  plan_name: string;
  plan_description: string;
  plan_benefits: string[];
  coverage_amount: number;
  coverage_used: number;
  monthly_premium: number;
  annual_premium: number;
}

interface Claim {
  id: number;
  type: string;
  hospital_name: string | null;
  service_date: string;
  amount: number;
  status: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending_medical: "Pending",
  pending_payment: "Pending",
  active: "Active",
  rejected: "Rejected",
  expired: "Expired",
};

const NEXT_STEP: Record<string, string> = {
  pending_medical: "/customer/medical-verification",
  pending_payment: "/customer/payment",
  active: "/customer/insurance-card",
};

export default function CustomerDashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const avatarUrl = useAuthenticatedImage(user ? "/api/users/me/photo/profile" : null);
  const [myPlan, setMyPlan] = useState<UserPlan | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);

  const load = () => {
    const token = localStorage.getItem("him_token");
    if (!token) return;

    fetch("http://localhost:5000/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (result?.success) {
          updateUser({
            phone: result.user.phone,
            nrc: result.user.nrc,
            verificationStatus: result.user.verificationStatus,
          });
        }
      })
      .catch(() => {});

    Promise.all([apiFetch("/api/plans/me"), apiFetch("/api/claims/me")])
      .then(([planRes, claimsRes]) => {
        setMyPlan(planRes.userPlan);
        setClaims(claimsRes.claims);
      })
      .catch(() => {});
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);
  useAutoRefresh(load);

  const stats = [
    { title: "Insurance Status", value: myPlan ? STATUS_LABEL[myPlan.status] : "Not started", icon: Shield, color: "teal" as const, index: 0 },
    { title: "Current Plan", value: myPlan?.plan_name || "None", icon: FileText, color: "blue" as const, index: 1 },
    { title: "Claims Submitted", value: claims.length, icon: Activity, color: "purple" as const, index: 2 },
    { title: "Coverage Amount", value: myPlan ? formatCurrency(myPlan.coverage_amount) : "—", icon: CreditCard, color: "emerald" as const, index: 3 },
  ];

  const isVerified = user?.verificationStatus === "verified";

  const steps = [
    { id: 1, label: "Account Created", done: true, path: "/customer/dashboard", locked: false, lockedReason: "" },
    { id: 2, label: "Identity Verified", done: isVerified, path: "/customer/verify-profile", locked: false, lockedReason: "" },
    { id: 3, label: "Plan Selected", done: !!myPlan, path: "/customer/plans", locked: !isVerified, lockedReason: "Verify your identity first" },
    {
      id: 4,
      label: "Medical Verification",
      done: !!myPlan && ["pending_payment", "active"].includes(myPlan.status),
      path: "/customer/medical-verification",
      locked: !myPlan,
      lockedReason: "Select a plan first",
    },
    {
      id: 5,
      label: "Payment",
      done: myPlan?.status === "active",
      path: "/customer/payment",
      locked: !myPlan || myPlan.status === "pending_medical",
      lockedReason: "Complete medical verification first",
    },
    {
      id: 6,
      label: "Insurance Active",
      done: myPlan?.status === "active",
      path: "/customer/insurance-card",
      locked: myPlan?.status !== "active",
      lockedReason: "Complete payment first",
    },
  ];
  const firstPendingIndex = steps.findIndex((s) => !s.done);

  const handleStepClick = (step: (typeof steps)[number]) => {
    if (step.locked) {
      toast.error(step.lockedReason);
      return;
    }
    navigate(step.path);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.name?.split(" ")[0]}! 👋`}
        subtitle="Here's an overview of your insurance status"
      />

      {/* Profile summary */}
      <GlassCard className="p-5 flex items-center gap-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt={user?.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 font-medium">
            {user?.name?.[0]}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-gray-900 dark:text-white font-medium truncate">{user?.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {user?.email} {user?.phone ? `· ${user.phone}` : ""} {user?.nrc ? `· NRC ${user.nrc}` : ""}
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 flex items-center gap-1 ${getStatusColor(user?.verificationStatus || "unverified")}`}>
          <BadgeCheck className="w-3.5 h-3.5" />
          {user?.verificationStatus === "verified" ? "Verified"
            : user?.verificationStatus === "pending" ? "Pending approval"
            : user?.verificationStatus === "rejected" ? "Rejected"
            : "Unverified"}
        </span>
      </GlassCard>

      {!isVerified && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-center gap-4 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.verificationStatus === "pending"
                ? "Your identity verification is awaiting admin approval"
                : user?.verificationStatus === "rejected"
                  ? "Your identity verification was rejected"
                  : "Verify your account to buy insurance"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.verificationStatus === "pending"
                ? "We'll notify you as soon as an admin reviews your documents."
                : user?.verificationStatus === "rejected"
                  ? "Please resubmit your NRC and personal photo."
                  : "Upload your NRC photo and a personal photo — it only takes a minute."}
            </p>
          </div>
          {user?.verificationStatus !== "pending" && (
            <button
              onClick={() => navigate("/customer/verify-profile")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium hover:from-amber-600 hover:to-orange-700 transition-all shrink-0"
            >
              Verify now <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Progress Tracker */}
        <GlassCard className="p-6">
          <h3 className="text-gray-900 dark:text-white mb-4">Application Progress</h3>
          <div className="space-y-3">
            {steps.map((step, i) => {
              const status = step.done ? "completed" : i === firstPendingIndex ? "current" : "pending";
              return (
                <motion.button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(step)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`w-full flex items-center gap-3 text-left rounded-lg -mx-2 px-2 py-1 transition-colors ${
                    step.locked ? "cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    status === "completed" ? "bg-emerald-500" :
                    status === "current" ? "bg-blue-500 animate-pulse" :
                    "bg-gray-200 dark:bg-gray-700"
                  }`}>
                    {status === "completed" ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : status === "current" ? (
                      <Clock className="w-4 h-4 text-white" />
                    ) : step.locked ? (
                      <Lock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                    )}
                  </div>
                  <p className={`text-sm flex-1 ${status === "pending" ? "text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-200"}`}>
                    {step.label}
                  </p>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
                </motion.button>
              );
            })}
          </div>
        </GlassCard>

        {/* Current Plan */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 dark:text-white">Current Plan</h3>
            {myPlan && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(myPlan.status === "active" ? "active" : "pending")}`}>
                {STATUS_LABEL[myPlan.status]}
              </span>
            )}
          </div>
          {myPlan ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{myPlan.plan_name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{myPlan.plan_description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Coverage</p>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(myPlan.coverage_amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Premium / year</p>
                    <p className="font-semibold text-teal-600 dark:text-teal-400">{formatCurrency(myPlan.annual_premium)}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Benefits included:</p>
                <ul className="space-y-1">
                  {myPlan.plan_benefits.slice(0, 3).map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              {NEXT_STEP[myPlan.status] && (
                <button
                  onClick={() => navigate(NEXT_STEP[myPlan.status])}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-medium hover:from-blue-700 hover:to-teal-700 transition-all"
                >
                  {myPlan.status === "active" ? "View Insurance Card" : "Continue enrollment"} <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm mb-3">No plan selected yet</p>
              <button
                onClick={() => navigate("/customer/plans")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm"
              >
                Browse plans <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Recent Claims */}
      <GlassCard className="p-6">
        <h3 className="text-gray-900 dark:text-white mb-4">Recent Claims</h3>
        {claims.length ? (
          <div className="space-y-3">
            {claims.slice(0, 5).map((claim) => (
              <div key={claim.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{claim.type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{claim.hospital_name || "—"} · {formatDate(claim.service_date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(claim.amount)}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>{claim.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No claims submitted yet</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
