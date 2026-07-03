export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("my-MM", { style: "currency", currency: "MMK", minimumFractionDigits: 0 }).format(amount);

export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    unpaid: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    verified: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return map[status] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
};

export const calculateBMI = (heightCm: number, weightKg: number) => {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
};

export const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500" };
  if (bmi < 25) return { label: "Normal", color: "text-emerald-500" };
  if (bmi < 30) return { label: "Overweight", color: "text-amber-500" };
  return { label: "Obese", color: "text-red-500" };
};

export const generatePolicyNumber = () =>
  `POL-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

export const getRiskLevel = (bmi: number, age: number, hasChronicDisease: boolean) => {
  let score = 0;
  if (bmi > 30) score += 2;
  else if (bmi > 25) score += 1;
  if (age > 50) score += 2;
  else if (age > 35) score += 1;
  if (hasChronicDisease) score += 3;
  if (score <= 1) return { level: "Low", multiplier: 1.0, color: "text-emerald-500" };
  if (score <= 3) return { level: "Medium", multiplier: 1.3, color: "text-amber-500" };
  return { level: "High", multiplier: 1.7, color: "text-red-500" };
};
