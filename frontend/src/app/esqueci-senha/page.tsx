"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiScissors, FiMail } from "react-icons/fi";
import { authApi } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { SALON_NAME } from "@/lib/constants";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
    } finally {
      setLoading(false);
      setSubmitted(true);
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
          <p className="mt-2 text-gray-500 text-sm">Recuperar senha</p>
        </div>

        <div className="auth-card">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FiMail className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Se este email estiver cadastrado, enviaremos instruções para redefinir sua senha.
              </p>
              <Link href="/login" className="block text-sm text-pink-500 font-medium hover:underline mt-4">
                Voltar para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600">
                Informe seu email e enviaremos um link para redefinir sua senha.
              </p>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
              <Button type="submit" loading={loading} fullWidth size="lg">
                Enviar link
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login" className="text-pink-500 font-medium hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
