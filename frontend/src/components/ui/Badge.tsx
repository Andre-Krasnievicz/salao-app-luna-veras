import React from "react";

type BadgeVariant = "green" | "pink" | "gray" | "red" | "yellow";

const variants: Record<BadgeVariant, string> = {
  green: "bg-green-100 text-green-700 border-green-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  gray: "bg-gray-100 text-gray-600 border-gray-200",
  red: "bg-red-100 text-red-700 border-red-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export default function Badge({ variant = "gray", children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function statusToBadge(status: string): BadgeVariant {
  switch (status) {
    case "confirmed": return "green";
    case "pending_payment": return "yellow";
    case "cancelled": return "gray";
    case "payment_failed": return "red";
    default: return "gray";
  }
}
