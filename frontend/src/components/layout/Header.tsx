"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiUser, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { useAuth } from "@/contexts/AuthContext";
import { useSalon } from "@/contexts/SalonContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { salonName } = useSalon();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-pink-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-pink-600 font-bold text-xl"
        >
          <HiSparkles className="w-6 h-6" />
          {salonName}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/agendar"
            className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors"
          >
            Agendar
          </Link>
          {user ? (
            <>
              {user.role === "admin" ? (
                <Link
                  href="/admin/dashboard"
                  className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/cliente"
                  className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors"
                >
                  Minha Conta
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-gray-500"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <FiX className="w-5 h-5" />
          ) : (
            <FiMenu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-3">
          <Link
            href="/agendar"
            onClick={() => setMenuOpen(false)}
            className="text-sm font-medium text-gray-700"
          >
            Agendar
          </Link>
          {user ? (
            <>
              {user.role === "admin" ? (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-gray-700"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/cliente"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-gray-700"
                >
                  Minha Conta
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="text-sm font-medium text-red-500 text-left"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-gray-700"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-pink-600"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
