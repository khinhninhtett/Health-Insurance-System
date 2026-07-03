import { Bell, Sun, Moon, Search, Menu } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const roleGradient =
    user?.role === "customer" ? "from-blue-600 to-teal-600" :
    user?.role === "hospital" ? "from-teal-600 to-emerald-600" :
    "from-purple-600 to-blue-600";

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
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search..."
        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  </div>

  {/* Right Section */}
  <div className="flex items-center gap-2 ml-auto">
    {/* Notifications */}
    <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
    </button>

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