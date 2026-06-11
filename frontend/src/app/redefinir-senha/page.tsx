"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiScissors, FiCheckCircle } from "react-icons/fi";
import { authApi } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getAxiosError } from "@/lib/utils";
import { SALON_NAME } from "@/lib/constants";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({ password: "", password_confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.password_confirm) {
      setError("As senhas não conferem.");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, form.password, form.password_confirm);
      setSuccess(true);
    } catch (err) {
      setError(getAxiosError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500">Link inválido ou expirado.</p>
          <Link href="/esqueci-senha" className="text-pink-500 text-sm mt-2 block hover:underline">Solicitar novo link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-pink-500 font-bold text-2xl">
            <FiScissors className="w-7 h-7" />
            {SALON_NAME}
          </Link>
          <p className="mt-2 text-gray-500 text-sm">Redefinir senha</p>
        </div>

        <div className="auth-card">
          {success ? (
            <div className="text-center space-y-4">
              <FiCheckCircle className="w-14 h-14 text-green-500 mx-auto" />
              <p className="text-sm text-gray-700">Senha redefinida com sucesso!</p>
              <Button onClick={() => router.push("/login")} fullWidth>Ir para o login</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nova senha"
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
                placeholder="Mínimo 8 caracteres"
              />
              <Input
                label="Confirmar nova senha"
                type="password"
                value={form.password_confirm}
                onChange={(e) => set("password_confirm", e.target.value)}
                required
                placeholder="Repita a senha"
              />
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <Button type="submit" loading={loading} fullWidth size="lg">
                Salvar nova senha
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
