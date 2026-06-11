import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { SALON_NAME } from "@/lib/constants";

export const metadata = { title: `Política de Privacidade - ${SALON_NAME}` };

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-pink-500 text-sm mb-8 hover:underline">
          <FiArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-500 mb-8">Última atualização: Janeiro de 2025</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">1. Dados que coletamos</h2>
            <p>Coletamos apenas os dados necessários para o funcionamento do serviço de agendamento:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Nome completo</strong> — para identificação no agendamento</li>
              <li><strong>Email</strong> — para acesso à conta e recuperação de senha</li>
              <li><strong>Número de WhatsApp</strong> — para envio de lembretes do agendamento</li>
              <li><strong>Dados do agendamento</strong> — data, horário e status</li>
              <li><strong>Status de pagamento</strong> — se a reserva foi paga ou não</li>
              <li><strong>Logs técnicos mínimos</strong> — para segurança e diagnóstico de erros</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">2. Finalidade do uso dos dados</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Permitir o cadastro e autenticação na plataforma</li>
              <li>Processar e confirmar agendamentos</li>
              <li>Enviar lembretes de agendamento via WhatsApp</li>
              <li>Recuperação de senha por email</li>
              <li>Prevenção de fraudes e segurança da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">3. Mercado Pago</h2>
            <p>
              Os pagamentos são processados pelo <strong>Mercado Pago</strong>. Não armazenamos dados de cartão de crédito ou débito. Apenas o status do pagamento e o identificador da transação são salvos. Consulte a{" "}
              <a href="https://www.mercadopago.com.br/privacidade" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline">
                Política de Privacidade do Mercado Pago
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">4. WhatsApp</h2>
            <p>
              Utilizamos a <strong>WhatsApp Business Cloud API</strong> da Meta para enviar lembretes de agendamento. Seu número de WhatsApp é usado exclusivamente para este fim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">5. Seus direitos (LGPD)</h2>
            <p>Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou incorretos</li>
              <li>Solicitar a exclusão dos seus dados</li>
              <li>Revogar o consentimento</li>
            </ul>
            <p className="mt-2">Para exercer seus direitos, acesse <strong>Minha Conta &gt; Exclusão de dados</strong> ou entre em contato conosco.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">6. Retenção de dados</h2>
            <p>
              Dados de pagamento e agendamento podem ser retidos pelo período necessário para obrigações legais, fiscais ou de prevenção a fraudes, mesmo após solicitação de exclusão.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">7. Contato</h2>
            <p>Em caso de dúvidas sobre esta política ou para exercer seus direitos, entre em contato através do WhatsApp do salão.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
