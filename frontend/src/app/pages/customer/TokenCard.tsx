import { useRef } from "react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, Shield, Calendar, User, CreditCard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { insurancePlans } from "../../data/mockData";
import { formatDate, getStatusColor } from "../../utils/helpers";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";

export default function TokenCard() {
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const plan = insurancePlans.find((p) => p.id === user?.selectedPlan) || insurancePlans[1];

  const tokenData = JSON.stringify({
    token: user?.tokenNumber || "HIM-2024-001234",
    name: user?.name,
    nrc: user?.nrc,
    plan: plan.name,
  });

  const handlePrint = () => {
    toast.success("Opening print dialog...");
    window.print();
  };

  const handleDownload = () => {
    toast.success("Token card downloaded as PDF!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Token Card"
        subtitle="Your official health insurance verification token"
        action={
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm hover:from-blue-700 hover:to-teal-700 transition-all shadow-md shadow-blue-500/20"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        }
      />

      <div className="max-w-md mx-auto" ref={cardRef}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20"
        >
          {/* Card Header */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-white" />
                <span className="text-white font-semibold">HealthInsure</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor("active")}`}>
                Active
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-blue-200 text-xs mb-1">Token Number</p>
                <p className="text-white text-xl font-bold tracking-wider">{user?.tokenNumber || "HIM-2024-001234"}</p>
              </div>
              <div className="bg-white rounded-xl p-2">
                <QRCodeSVG value={tokenData} size={80} level="M" />
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="bg-white dark:bg-gray-900 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs text-gray-400">Full Name</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs text-gray-400">NRC Number</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.nrc || "12/OuKaMa(N)123456"}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Shield className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-xs text-gray-400">Insurance Plan</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{plan.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs text-gray-400">Registration Date</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(user?.registrationDate || "2024-01-15")}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs text-gray-400">Status</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor("active")}`}>Active</span>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-3">
            <p className="text-blue-100 text-xs text-center">Present this card at any verified hospital for verification</p>
          </div>
        </motion.div>
      </div>

      {/* Instructions */}
      <GlassCard className="p-6 max-w-md mx-auto">
        <h3 className="text-gray-900 dark:text-white mb-3">How to use your token card</h3>
        <ol className="space-y-2">
          {[
            "Present this token card at any verified hospital",
            "Hospital staff will scan the QR code for verification",
            "Your medical examination will be recorded digitally",
            "After verification, your insurance will be activated",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </GlassCard>
    </div>
  );
}
