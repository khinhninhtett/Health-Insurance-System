import { useEffect, useState } from "react";
import { Users, Shield, Clock, CreditCard, FileText, TrendingUp, DollarSign, Minus } from "lucide-react";
import { apiFetch } from "../../utils/api";
import { formatCurrency } from "../../utils/helpers";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import StatCard from "../../components/shared/StatCard";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";

const COLORS = ["#3B82F6", "#0D9488", "#8B5CF6", "#F59E0B"];

interface Stats {
  totalCustomers: number;
  activePolicies: number;
  pendingVerifications: number;
  pendingPayments: number;
  totalClaims: number;
  revenue: number;
  expenses: number;
  profit: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number; claims: number }>>([]);
  const [customerGrowthData, setCustomerGrowthData] = useState<Array<{ month: string; customers: number }>>([]);
  const [planDistributionData, setPlanDistributionData] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiFetch("/api/admin/stats"), apiFetch("/api/admin/reports")])
      .then(([statsRes, reportsRes]) => {
        setStats(statsRes.stats);
        setRevenueData(reportsRes.revenueData);
        setCustomerGrowthData(reportsRes.customerGrowthData);
        setPlanDistributionData(reportsRes.planDistributionData);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { title: "Total Customers", value: stats.totalCustomers, icon: Users, color: "blue" as const, index: 0 },
    { title: "Active Policies", value: stats.activePolicies, icon: Shield, color: "teal" as const, index: 1 },
    { title: "Pending Medical Reviews", value: stats.pendingVerifications, icon: Clock, color: "amber" as const, index: 2 },
    { title: "Pending Payments", value: stats.pendingPayments, icon: CreditCard, color: "purple" as const, index: 3 },
    { title: "Total Claims", value: stats.totalClaims, icon: FileText, color: "red" as const, index: 4 },
    { title: "Revenue (MMK)", value: formatCurrency(stats.revenue), icon: TrendingUp, color: "emerald" as const, index: 5 },
    { title: "Claims Paid (MMK)", value: formatCurrency(stats.expenses), icon: Minus, color: "red" as const, index: 6 },
    { title: "Profit (MMK)", value: formatCurrency(stats.profit), icon: DollarSign, color: "teal" as const, index: 7 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" subtitle="System overview and key metrics" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((c) => <StatCard key={c.title} {...c} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="text-gray-900 dark:text-white mb-4">Monthly Revenue vs Claims</h3>
          {revenueData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="claimsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="claims" stroke="#EF4444" fill="url(#claimsGrad)" strokeWidth={2} name="Claims" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-16">No revenue data yet</p>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-gray-900 dark:text-white mb-4">Plan Distribution</h3>
          {planDistributionData.length ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={planDistributionData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {planDistributionData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {planDistributionData.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 dark:text-gray-400">{p.name}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{p.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-16">No active policies yet</p>
          )}
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-gray-900 dark:text-white mb-4">Customer Growth</h3>
        {customerGrowthData.length ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={customerGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="customers" fill="#0D9488" radius={[6, 6, 0, 0]} name="New Customers" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-16">No customer data yet</p>
        )}
      </GlassCard>
    </div>
  );
}
