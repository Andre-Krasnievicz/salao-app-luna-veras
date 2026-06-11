import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  pink?: boolean;
}

export default function Card({ children, className = "", pink = false }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl border p-5 shadow-sm
        ${pink ? "bg-pink-50 border-pink-200" : "bg-white border-gray-100"}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
