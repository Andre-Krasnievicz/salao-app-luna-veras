"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiScissors } from "react-icons/fi";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getAxiosError } from "@/lib/utils";
import { SALON_NAME } from "@/lib/constants";

export default function CadastroPage() {
  const { refresh } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirm: "",
    terms_accepted: false,
    privacy_policy_accepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string, value: string | boolean) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.password_confirm) {
      setError("As senhas não conferem.");
      return;
    }
    setLoading(true);
    try {
      await authApi.register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        password_confirm: form.password_confirm,
        terms_accepted: form.terms_accepted,
        privacy_policy_accepted: form.privacy_policy_accepted,
      });
      await refresh();
      router.push("/cliente");
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
          <Link href="/" className="inline-flex items-center gap-2 text-pink-500 font-bold text-2xl">
            <FiScissors className="w-7 h-7" />
            {SALON_NAME}
          </Link>
          <p className="mt-2 text-gray-500 text-sm">Crie sua conta</p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nome completo" value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Maria Silva" />
            <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required placeholder="seu@email.com" />
            <Input label="WhatsApp" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} required placeholder="11999999999" />
            <Input label="Senha" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required placeholder="Mínimo 8 caracteres" />
            <Input label="Confirmar senha" type="password" value={form.password_confirm} onChange={(e) => set("password_confirm", e.target.value)} required placeholder="Repita a senha" />

            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-pink-500"
                  checked={form.terms_accepted}
                  onChange={(e) => set("terms_accepted", e.target.checked)}
                  required
                />
                <span className="text-xs text-gray-600">
                  Li e aceito os{" "}
                  <Link href="/termos-de-uso" target="_blank" className="text-pink-500 hover:underline font-medium">
                    Termos de Uso
                  </Link>
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-pink-500"
                  checked={form.privacy_policy_accepted}
                  onChange={(e) => set("privacy_policy_accepted", e.target.checked)}
                  required
                />
                <span className="text-xs text-gray-600">
                  Li e aceito a{" "}
                  <Link href="/politica-privacidade" target="_blank" className="text-pink-500 hover:underline font-medium">
                    Política de Privacidade
                  </Link>
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} fullWidth size="lg">
              Criar conta
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-pink-500 font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
