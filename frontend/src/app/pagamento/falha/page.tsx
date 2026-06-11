"use client";

import React from "react";
import Link from "next/link";
import { FiXCircle, FiRefreshCw } from "react-icons/fi";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";

export default function PagamentoFalhaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <FiXCircle className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pagamento não aprovado</h1>
            <p className="text-gray-600 mt-2">
              O pagamento não foi concluído. O horário foi liberado e você pode tentar novamente.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/agendar">
              <Button fullWidth size="lg">
                <FiRefreshCw className="w-5 h-5" />
                Tentar novamente
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" fullWidth>
                Voltar ao início
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
