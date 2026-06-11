"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiGrid, FiSettings, FiShield, FiLogOut, FiMenu } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { useAuth } from "@/contexts/AuthContext";
import { SALON_NAME } from "@/lib/constants";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/admin/configuracoes", label: "Configurações", icon: FiSettings },
  { href: "/admin/lgpd", label: "LGPD", icon: FiShield },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-pink-100">
        <HiSparkles className="w-6 h-6 text-pink-500" />
        <span className="font-bold text-lg text-gray-800">{SALON_NAME}</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === href
                ? "bg-pink-500 text-white shadow-sm"
                : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <FiLogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-shrink-0 bg-white border-r border-gray-100 shadow-sm">
        <div className="w-full">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 bg-white border-b border-gray-100 px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-gray-500"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-800">Admin</span>
        </div>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
