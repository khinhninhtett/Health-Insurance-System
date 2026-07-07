import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Bell, Sun, Moon, Search, Menu, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../utils/api";
import { formatRelativeTime } from "../../utils/helpers";
import { customerNavItems, adminNavItems } from "./Sidebar";

interface NavbarProps {
  onMenuClick: () => void;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  createdAt: string;
}

interface AdminSearchResults {
  customers: { id: number; name: string; email: string; nrc: string }[];
  plans: { id: number; name: string; monthly_premium: number }[];
  payments: { id: number; transaction_id: string; amount: number; status: string; customer_name: string }[];
  claims: { id: number; type: string; hospital_name: string | null; status: string; customer_name: string }[];
}

const EMPTY_RESULTS: AdminSearchResults = { customers: [], plans: [], payments: [], claims: [] };

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const navItems = isAdmin ? adminNavItems : customerNavItems;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [adminResults, setAdminResults] = useState<AdminSearchResults>(EMPTY_RESULTS);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifBoxRef = useRef<HTMLDivElement>(null);

  const roleGradient =
    user?.role === "customer" ? "from-blue-600 to-teal-600" :
    user?.role === "hospital" ? "from-teal-600 to-emerald-600" :
    "from-purple-600 to-blue-600";

  const loadNotifications = () => {
    apiFetch("/api/notifications")
      .then((res) => {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifBoxRef.current && !notifBoxRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const term = searchTerm.trim();
    if (!term) {
      setAdminResults(EMPTY_RESULTS);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(() => {
      apiFetch(`/api/admin/search?q=${encodeURIComponent(term)}`)
        .then((res) => setAdminResults(res.results))
        .catch(() => setAdminResults(EMPTY_RESULTS))
        .finally(() => setSearching(false));
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, isAdmin]);

  const pageMatches = searchTerm.trim()
    ? navItems.filter((item) => item.label.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    : [];

  const goTo = (path: string) => {
    navigate(path);
    setSearchTerm("");
    setSearchOpen(false);
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) {
      apiFetch(`/api/notifications/${n.id}/read`, { method: "POST" }).catch(() => {});
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setNotifOpen(false);
    if (n.link) navigate(n.link);
  };

  const markAllRead = async () => {
    try {
      await apiFetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // no-op
    }
  };

  const hasAdminResults =
    adminResults.customers.length > 0 || adminResults.plans.length > 0 ||
    adminResults.payments.length > 0 || adminResults.claims.length > 0;

  return (
<header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-4 sticky top-0 z-30">

  {/* Left Section */}
  <div className="flex items-center flex-1 max-w-xl">

    {/* Sidebar Toggle */}
    <button
      onClick={onMenuClick}
      className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
    >
      <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    </button>

    {/* Divider */}
    <div className="mx-3 h-6 w-px bg-gray-200 dark:bg-gray-700" />

    {/* Search */}
    <div className="relative flex-1" ref={searchBoxRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setSearchOpen(true)}
        placeholder={isAdmin ? "Search customers, claims, payments, plans..." : "Search features..."}
        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />

      {searchOpen && searchTerm.trim() && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl max-h-96 overflow-y-auto z-40">
          {pageMatches.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Pages</p>
              {pageMatches.map((item) => (
                <button
                  key={item.path}
                  onClick={() => goTo(item.path)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                >
                  <item.icon className="w-4 h-4 text-gray-400 shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {isAdmin && (
            <div className="p-2 border-t border-gray-100 dark:border-gray-800">
              {searching ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              ) : hasAdminResults ? (
                <>
                  {adminResults.customers.length > 0 && (
                    <div className="mb-2">
                      <p className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Customers</p>
                      {adminResults.customers.map((c) => (
                        <button key={c.id} onClick={() => goTo(`/admin/customers?q=${encodeURIComponent(c.email)}`)}
                          className="w-full flex flex-col items-start px-2 py-1.5 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-left">
                          <span className="text-gray-900 dark:text-white">{c.name}</span>
                          <span className="text-xs text-gray-400">{c.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {adminResults.plans.length > 0 && (
                    <div className="mb-2">
                      <p className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Plans</p>
                      {adminResults.plans.map((p) => (
                        <button key={p.id} onClick={() => goTo("/admin/plans")}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-left">
                          <span className="text-gray-900 dark:text-white">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {adminResults.payments.length > 0 && (
                    <div className="mb-2">
                      <p className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Payments</p>
                      {adminResults.payments.map((p) => (
                        <button key={p.id} onClick={() => goTo("/admin/payments")}
                          className="w-full flex flex-col items-start px-2 py-1.5 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-left">
                          <span className="text-gray-900 dark:text-white">{p.customer_name} · {p.transaction_id}</span>
                          <span className="text-xs text-gray-400 capitalize">{p.status}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {adminResults.claims.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Claims</p>
                      {adminResults.claims.map((c) => (
                        <button key={c.id} onClick={() => goTo("/admin/claims")}
                          className="w-full flex flex-col items-start px-2 py-1.5 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-left">
                          <span className="text-gray-900 dark:text-white">{c.customer_name} · {c.type}</span>
                          <span className="text-xs text-gray-400 capitalize">{c.status}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : pageMatches.length === 0 ? (
                <p className="px-2 py-3 text-sm text-gray-400 text-center">No results found</p>
              ) : null}
            </div>
          )}

          {!isAdmin && pageMatches.length === 0 && (
            <p className="px-2 py-3 text-sm text-gray-400 text-center">No matching features</p>
          )}
        </div>
      )}
    </div>
  </div>

  {/* Right Section */}
  <div className="flex items-center gap-2 ml-auto">
    {/* Notifications */}
    <div className="relative" ref={notifBoxRef}>
      <button
        onClick={() => setNotifOpen((o) => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-semibold rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {notifOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl max-h-96 overflow-y-auto z-40">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-sm text-gray-400 text-center">No notifications yet</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                  !n.is_read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                  <div className={`min-w-0 flex-1 ${n.is_read ? "pl-3.5" : ""}`}>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>

    {/* Theme */}
    <button
      onClick={toggleTheme}
      className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>

    {/* Avatar */}
    <div
      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleGradient} flex items-center justify-center text-white text-sm font-bold cursor-pointer`}
    >
      {user?.avatar || user?.name?.[0]}
    </div>
  </div>

</header>
  );
}
