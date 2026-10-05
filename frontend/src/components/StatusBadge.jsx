"use client";

import { Clock, ChefHat, CheckCircle2, CheckCheck, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    label: "Order Pending",
    bg: "bg-amber-500/10 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    dot: "bg-amber-500",
    icon: Clock,
  },
  preparing: {
    label: "Kitchen Preparing",
    bg: "bg-blue-500/10 text-blue-900 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    dot: "bg-blue-600",
    icon: ChefHat,
  },
  ready: {
    label: "Ready for Pickup",
    bg: "bg-emerald-500/10 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    dot: "bg-emerald-600",
    icon: CheckCircle2,
  },
  completed: {
    label: "Order Completed",
    bg: "bg-stone-200/60 text-stone-800 border-stone-300 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-800",
    dot: "bg-stone-600",
    icon: CheckCheck,
  },
  cancelled: {
    label: "Order Cancelled",
    bg: "bg-rose-500/10 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    dot: "bg-rose-600",
    icon: XCircle,
  },
};

export default function StatusBadge({ status, size = "md", showIcon = true }) {
  const normalized = (status || "pending").toLowerCase();
  const config = STATUS_CONFIG[normalized] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  const sizeClasses =
    size === "sm"
      ? "text-xs px-2 py-0.5 gap-1.5"
      : size === "lg"
      ? "text-xs px-3.5 py-1.5 gap-2 font-bold"
      : "text-xs px-2.5 py-1 gap-1.5 font-bold";

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs ${config.bg} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      <span>{config.label}</span>
    </span>
  );
}
