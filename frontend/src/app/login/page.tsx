"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiScissors, FiMail, FiLock } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { useAuth } from "@/contexts/AuthContext";
import { SALON_NAME } from "@/lib/constants";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getAxiosError } from "@/lib/utils";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || null;

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "admin") {
        router.push(redirect || "/admin/dashboard");
      } else {
        router.push(redirect || "/cliente");
      }
    } catch (err) {
      setError(getAxiosError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-pink-500 font-bold text-2xl"
          >
            {/* <FiScissors className="w-7 h-7" /> */}
            <HiSparkles className="w-7 h-7" />
            {SALON_NAME}
          </Link>
          <p className="mt-2 text-gray-500 text-sm">Entre na sua conta</p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
              autoComplete="email"
              placeholder="seu@email.com"
            />
            <Input
              label="Senha"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Sua senha"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="text-right">
              <Link
                href="/esqueci-senha"
                className="text-xs text-pink-500 hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg">
              Entrar
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Não tem conta?{" "}
          <Link
            href="/cadastro"
            className="text-pink-500 font-medium hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
