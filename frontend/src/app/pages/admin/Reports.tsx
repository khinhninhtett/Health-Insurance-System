import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Download, FileText, BarChart3, Users, TrendingUp } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { apiFetch } from "../../utils/api";
import { formatCurrency } from "../../utils/helpers";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";

const reports = [
  { id: "revenue", icon: TrendingUp, title: "Revenue Report" },
  { id: "profit", icon: BarChart3, title: "Profit & Loss" },
  { id: "customers", icon: Users, title: "Customer Report" },
  { id: "claims", icon: FileText, title: "Claims Report" },
];

const exportFormats = [
  { label: "PDF", icon: "📄" },
  { label: "Excel", icon: "📊" },
  { label: "CSV", icon: "📋" },
];

interface RevenueRow {
  month: string;
  revenue: number;
  claims: number;
  profit: number;
}

export default function Reports() {
  const [activeReport, setActiveReport] = useState("revenue");
  const [revenueData, setRevenueData] = useState<RevenueRow[]>([]);
  const [customerGrowthData, setCustomerGrowthData] = useState<Array<{ month: string; customers: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/admin/reports")
      .then((res) => {
        setRevenueData(res.revenueData);
        setCustomerGrowthData(res.customerGrowthData);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = (format: string) => {
    toast("Export isn't implemented yet — showing on-screen only.", { icon: "ℹ️" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate and export system reports"
        action={
          <div className="flex gap-2">
            {exportFormats.map(({ label, icon }) => (
              <button key={label} onClick={() => handleExport(label)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex gap-2 flex-wrap">
        {reports.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeReport === r.id
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <r.icon className="w-4 h-4" />
            {r.title}
          </button>
        ))}
      </div>

      {activeReport === "revenue" && (
        <motion.div key="revenue" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6">
            <h3 className="text-gray-900 dark:text-white mb-4">Monthly Revenue</h3>
            {revenueData.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#rGrad)" strokeWidth={2} name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 text-center py-16">No revenue yet</p>}
          </GlassCard>
        </motion.div>
      )}

      {activeReport === "profit" && (
        <motion.div key="profit" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6">
            <h3 className="text-gray-900 dark:text-white mb-4">Profit & Loss</h3>
            {revenueData.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }} />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="claims" fill="#EF4444" radius={[4, 4, 0, 0]} name="Claims Paid" />
                  <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 text-center py-16">No data yet</p>}
          </GlassCard>
        </motion.div>
      )}

      {activeReport === "customers" && (
        <motion.div key="customers" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6">
            <h3 className="text-gray-900 dark:text-white mb-4">Customer Growth</h3>
            {customerGrowthData.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={customerGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }} />
                  <Line type="monotone" dataKey="customers" stroke="#0D9488" strokeWidth={3} dot={{ fill: "#0D9488", r: 5 }} name="Customers" />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 text-center py-16">No data yet</p>}
          </GlassCard>
        </motion.div>
      )}

      {activeReport === "claims" && (
        <motion.div key={activeReport} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-12">
            <div className="text-center text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-gray-600 dark:text-gray-400">{reports.find((r) => r.id === activeReport)?.title}</p>
              <p className="text-sm mt-1 text-gray-400">See the Claims Workflow page for detailed data.</p>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 dark:text-white">Financial Summary</h3>
          <button onClick={() => handleExport("Excel")} className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline">
            <Download className="w-3.5 h-3.5" /> Excel
          </button>
        </div>
        {revenueData.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {["Month", "Revenue", "Claims Paid", "Profit", "Margin"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {revenueData.map((row) => {
                  const margin = row.revenue ? ((row.profit / row.revenue) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={row.month} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white">{row.month}</td>
                      <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400">{formatCurrency(row.revenue)}</td>
                      <td className="py-2.5 px-3 text-red-600 dark:text-red-400">{formatCurrency(row.claims)}</td>
                      <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">{formatCurrency(row.profit)}</td>
                      <td className="py-2.5 px-3 text-gray-600 dark:text-gray-400">{margin}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No financial data yet</p>
        )}
      </GlassCard>
    </div>
  );
}
