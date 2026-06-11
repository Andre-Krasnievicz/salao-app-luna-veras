"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { FiCalendar, FiShield, FiClock } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import Header from "@/components/layout/Header";
import { publicApi } from "@/lib/api";
import { useSalon } from "@/contexts/SalonContext";

export default function HomePage() {
  const { salonName } = useSalon();

  useEffect(() => {
    publicApi.recordVisit("/").catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <main className="flex-1">
        <section className="bg-gradient-to-br from-pink-50 via-white to-pink-50 py-20 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-sm font-medium">
              <HiSparkles className="w-7 h-7" />
              Agendamento Online
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Bem-vinda ao <span className="text-pink-500">{salonName}</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Agende seu horário de forma rápida, simples e segura. Cuide das
              suas unhas com quem você merece.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/agendar"
                className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-sm"
              >
                <FiCalendar className="w-5 h-5" />
                Agendar horário
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white hover:bg-pink-50 text-pink-600 font-semibold px-8 py-3.5 rounded-xl border border-pink-200 transition-colors"
              >
                Entrar na minha conta
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">
              Por que escolher o {salonName}?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: FiCalendar,
                  title: "Fácil de agendar",
                  desc: "Escolha data e horário diretamente pelo celular ou computador.",
                },
                {
                  icon: FiShield,
                  title: "Pagamento seguro",
                  desc: "Reserva com pagamento via Mercado Pago, rápido e sem burocracia.",
                },
                {
                  icon: FiClock,
                  title: "Lembretes automáticos",
                  desc: "Receba lembrete no WhatsApp 1 hora antes do seu horário.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col items-center text-center p-6 rounded-2xl bg-pink-50 border border-pink-100"
                >
                  <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <HiSparkles className="w-4 h-4 text-pink-400" />
            <span>
              {salonName} &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/politica-privacidade"
              className="hover:text-pink-500 transition-colors"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/termos-de-uso"
              className="hover:text-pink-500 transition-colors"
            >
              Termos de Uso
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
