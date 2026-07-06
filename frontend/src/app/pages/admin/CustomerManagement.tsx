import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { motion } from "motion/react";
import { Search, Eye, Shield, CreditCard, Activity, ImageOff } from "lucide-react";
import { apiFetch } from "../../utils/api";
import { formatDate, getStatusColor } from "../../utils/helpers";
import { useAuthenticatedImage } from "../../hooks/useAuthenticatedImage";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  nrc: string;
  date_of_birth: string | null;
  address: string | null;
  verification_status: string;
  createdAt: string;
  plan_status: string | null;
  policy_number: string | null;
  plan_name: string | null;
}

export default function CustomerManagement() {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selected, setSelected] = useState<Customer | null>(null);

  useEffect(() => {
    apiFetch("/api/admin/customers")
      .then((res) => setCustomers(res.customers))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.policy_number || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Management" subtitle={`${customers.length} registered customers`} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, policy number..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
        />
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Policy</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Identity</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enrollment</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{c.policy_number || "—"}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{c.plan_name || "—"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(c.verification_status)}`}>{c.verification_status}</span>
                  </td>
                  <td className="py-3 px-4">
                    {c.plan_status ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(c.plan_status === "active" ? "active" : "pending")}`}>{c.plan_status}</span>
                    ) : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => setSelected(c)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Eye className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                  {selected.name[0]}
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white">{selected.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selected.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Identity", value: selected.verification_status, icon: Activity },
                  { label: "Plan", value: selected.plan_status || "none", icon: CreditCard },
                  { label: "Policy", value: selected.plan_status === "active" ? "active" : "pending", icon: Shield },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                    <Icon className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                    <p className="text-xs text-gray-400">{label}</p>
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm">
                {[
                  ["NRC", selected.nrc],
                  ["Phone", selected.phone],
                  ["Date of Birth", selected.date_of_birth ? formatDate(selected.date_of_birth) : "—"],
                  ["Address", selected.address || "—"],
                  ["Policy Number", selected.policy_number || "—"],
                  ["Plan", selected.plan_name || "—"],
                  ["Registered", formatDate(selected.createdAt)],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="text-gray-500 dark:text-gray-400">{l}</span>
                    <span className="font-medium text-gray-900 dark:text-white text-right max-w-[60%]">{v}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Identity documents</p>
                <div className="grid grid-cols-3 gap-2">
                  <IdentityPhoto customerId={selected.id} type="nrcFront" label="NRC front" />
                  <IdentityPhoto customerId={selected.id} type="nrcBack" label="NRC back" />
                  <IdentityPhoto customerId={selected.id} type="profile" label="Personal photo" />
                </div>
              </div>

              <button onClick={() => setSelected(null)} className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm">Close</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function IdentityPhoto({ customerId, type, label }: { customerId: number; type: "nrcFront" | "nrcBack" | "profile"; label: string }) {
  const url = useAuthenticatedImage(`/api/admin/customers/${customerId}/photo/${type}`);

  return (
    <div className="text-center">
      <div className="w-full aspect-square rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
        {url ? (
          <img src={url} alt={label} className="w-full h-full object-cover" />
        ) : (
          <ImageOff className="w-5 h-5 text-gray-300 dark:text-gray-600" />
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}
