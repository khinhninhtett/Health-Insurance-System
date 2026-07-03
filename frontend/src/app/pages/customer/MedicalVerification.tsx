import { motion } from "motion/react";
import { CheckCircle, Clock, Hospital, Activity, Droplets, Heart, Scale } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { hospitals } from "../../data/mockData";
import { formatDate } from "../../utils/helpers";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";

const timeline = [
  { label: "Token Card Received", date: "2024-01-15", status: "done", desc: "Your insurance token card was generated" },
  { label: "Appointment Scheduled", date: "2024-01-18", status: "done", desc: "Appointment at Yangon General Hospital" },
  { label: "Medical Examination", date: "2024-01-20", status: "done", desc: "Physical examination completed by Dr. Thida Win" },
  { label: "Lab Results Uploaded", date: "2024-01-22", status: "done", desc: "Blood tests and reports reviewed" },
  { label: "Verification Approved", date: "2024-01-25", status: "done", desc: "Medical verification approved by hospital" },
  { label: "Premium Calculated", date: "2024-01-28", status: "pending", desc: "Waiting for premium calculation" },
];

export default function MedicalVerification() {
  const { user } = useAuth();
  const mv = user?.medicalVerification as {
    status: string; date: string; hospital: string; bmi: number;
    bloodPressure: string; heartRate: number; bloodGroup: string;
  } | undefined;

  const hospital = hospitals.find((h) => h.id === mv?.hospital) || hospitals[0];

  return (
    <div className="space-y-6">
      <PageHeader title="Medical Verification" subtitle="Track your medical examination and verification status" />

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-5 border flex items-center gap-4 ${
          mv?.status === "approved"
            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
            : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
        }`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          mv?.status === "approved" ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-amber-100 dark:bg-amber-900/40"
        }`}>
          {mv?.status === "approved"
            ? <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            : <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          }
        </div>
        <div>
          <p className={`font-semibold ${mv?.status === "approved" ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
            Verification {mv?.status === "approved" ? "Approved" : "Pending"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {mv?.status === "approved"
              ? `Verified on ${formatDate(mv.date)} at ${hospital.name}`
              : "Your medical verification is being processed"}
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Medical Results */}
        {mv && (
          <GlassCard className="p-6">
            <h3 className="text-gray-900 dark:text-white mb-4">Medical Examination Results</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "BMI", value: mv.bmi, icon: Scale, color: "blue", unit: "kg/m²" },
                { label: "Blood Pressure", value: mv.bloodPressure, icon: Activity, color: "red", unit: "mmHg" },
                { label: "Heart Rate", value: mv.heartRate, icon: Heart, color: "pink", unit: "bpm" },
                { label: "Blood Group", value: mv.bloodGroup, icon: Droplets, color: "red", unit: "" },
              ].map(({ label, value, icon: Icon, color, unit }) => (
                <div key={label} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className={`w-8 h-8 rounded-lg mb-2 flex items-center justify-center bg-${color}-100 dark:bg-${color}-900/30`}>
                    <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{value} <span className="text-xs font-normal text-gray-400">{unit}</span></p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Hospital className="w-4 h-4 text-blue-500" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Examined at</p>
              </div>
              <p className="text-sm text-gray-900 dark:text-white">{hospital.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{hospital.address}</p>
            </div>
          </GlassCard>
        )}

        {/* Timeline */}
        <GlassCard className="p-6">
          <h3 className="text-gray-900 dark:text-white mb-4">Verification Timeline</h3>
          <div className="relative space-y-0">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-3 pb-4"
              >
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 ${
                    item.status === "done" ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"
                  }`}>
                    {item.status === "done"
                      ? <CheckCircle className="w-4 h-4 text-white" />
                      : <Clock className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                  {i < timeline.length - 1 && (
                    <div className={`w-0.5 flex-1 mt-1 ${item.status === "done" ? "bg-emerald-300 dark:bg-emerald-700" : "bg-gray-200 dark:bg-gray-700"}`} style={{ minHeight: 24 }} />
                  )}
                </div>
                <div className="pt-0.5 pb-2">
                  <p className={`text-sm font-medium ${item.status === "done" ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  {item.status === "done" && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{formatDate(item.date)}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
