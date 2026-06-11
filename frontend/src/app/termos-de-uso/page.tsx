import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { SALON_NAME } from "@/lib/constants";

export const metadata = { title: `Termos de Uso - ${SALON_NAME}` };

export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-pink-500 text-sm mb-8 hover:underline">
          <FiArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
        <p className="text-sm text-gray-500 mb-8">Última atualização: Janeiro de 2025</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">1. Aceitação dos termos</h2>
            <p>
              Ao criar uma conta e usar os serviços do {SALON_NAME}, você concorda com estes Termos de Uso. Se não concordar, não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">2. Sobre o serviço</h2>
            <p>
              O {SALON_NAME} oferece uma plataforma de agendamento online de serviços de manicure. O agendamento é confirmado somente após o pagamento da taxa de reserva.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">3. Uso da plataforma</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Você deve fornecer informações verdadeiras e atualizadas</li>
              <li>É proibido usar a plataforma para fins fraudulentos ou ilegais</li>
              <li>Cada conta é pessoal e intransferível</li>
              <li>Você é responsável pela segurança da sua senha</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">4. Agendamentos e pagamentos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Um agendamento é reservado somente após o pagamento da taxa de reserva via Mercado Pago</li>
              <li>Em caso de não comparecimento, a taxa de reserva poderá não ser reembolsada</li>
              <li>Cancelamentos devem ser solicitados com antecedência através dos canais do salão</li>
              <li>O valor total do serviço é pago diretamente no salão no dia do atendimento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">5. Lembretes</h2>
            <p>
              Ao cadastrar seu número de WhatsApp, você autoriza o envio de lembretes de agendamento via WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">6. Limitação de responsabilidade</h2>
            <p>
              O salão não se responsabiliza por problemas técnicos fora de seu controle, como falhas no serviço de pagamento ou na entrega de mensagens WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">7. Alterações nos termos</h2>
            <p>
              Reservamos o direito de alterar estes termos. Alterações serão comunicadas e o uso contínuo da plataforma implica aceitação das novas condições.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">8. Contato</h2>
            <p>Entre em contato através do WhatsApp do salão para dúvidas ou reclamações.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
