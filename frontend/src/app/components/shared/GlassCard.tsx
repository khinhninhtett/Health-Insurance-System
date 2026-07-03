import { motion } from "motion/react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export default function GlassCard({ children, className = "", hover = false, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={hover ? { y: -2, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)" } : undefined}
      className={`bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}
