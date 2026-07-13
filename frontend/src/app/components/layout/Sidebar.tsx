import { NavLink, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, Shield, FileText, Calculator,
  CreditCard, ClipboardList, LogOut, HeartPulse,
  Users, BarChart3,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  collapsed: boolean;
}

export const customerNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/customer/dashboard" },
  { icon: Shield, label: "Insurance Plans", path: "/customer/plans" },
  { icon: HeartPulse, label: "Medical Verification", path: "/customer/medical-verification" },
  { icon: Calculator, label: "Premium Calculator", path: "/customer/premium" },
  { icon: CreditCard, label: "Payment", path: "/customer/payment" },
  { icon: FileText, label: "Insurance Card", path: "/customer/insurance-card" },
  { icon: ClipboardList, label: "Claims", path: "/customer/claims" },
];

export const adminNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: HeartPulse, label: "Medical Verification", path: "/admin/medical-verification" },
  { icon: CreditCard, label: "Payments", path: "/admin/payments" },
  { icon: ClipboardList, label: "Claims", path: "/admin/claims" },
  { icon: Users, label: "Customers", path: "/admin/customers" },
  { icon: Shield, label: "Insurance Plans", path: "/admin/plans" },
  { icon: BarChart3, label: "Reports", path: "/admin/reports" },
];

export default function Sidebar({ collapsed }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = user?.role === "admin" ? adminNavItems : customerNavItems;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-200 dark:border-gray-800 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-emerald-500" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">Insure<span className="text-emerald-500">Glass</span></p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role === "admin" ? "Admin Portal" : "Customer Portal"}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md shadow-blue-500/20"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              } ${collapsed ? "justify-center" : ""}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="border-t border-gray-200 dark:border-gray-800 px-2 py-3 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.avatar || user?.name?.[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}