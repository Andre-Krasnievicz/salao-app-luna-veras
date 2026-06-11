"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  primary: "bg-pink-500 hover:bg-pink-600 text-white border-transparent shadow-sm",
  secondary: "bg-pink-100 hover:bg-pink-200 text-pink-700 border-transparent",
  outline: "bg-white hover:bg-pink-50 text-pink-600 border-pink-300",
  ghost: "bg-transparent hover:bg-pink-50 text-pink-600 border-transparent",
  danger: "bg-red-500 hover:bg-red-600 text-white border-transparent",
};

const sizes = {
  sm: "text-xs px-3 py-1.5 rounded-md",
  md: "text-sm px-4 py-2 rounded-lg",
  lg: "text-base px-6 py-3 rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium border
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-1
        disabled:opacity-60 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
