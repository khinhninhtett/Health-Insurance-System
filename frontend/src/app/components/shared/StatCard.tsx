import { motion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: "blue" | "teal" | "purple" | "amber" | "emerald" | "red";
  index?: number;
}

const colorMap = {
  blue: { bg: "bg-blue-50 dark:bg-blue-900/20", icon: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  teal: { bg: "bg-teal-50 dark:bg-teal-900/20", icon: "bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400", border: "border-teal-200 dark:border-teal-800" },
  purple: { bg: "bg-purple-50 dark:bg-purple-900/20", icon: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
  amber: { bg: "bg-amber-50 dark:bg-amber-900/20", icon: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
  red: { bg: "bg-red-50 dark:bg-red-900/20", icon: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
};

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, color = "blue", index = 0 }: StatCardProps) {
  const colors = colorMap[color];
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`rounded-2xl border ${colors.border} ${colors.bg} p-5 backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(trend)}% {trendLabel || "vs last month"}</span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
