# Salão Luna — MVP de Agendamento

Sistema de agendamento online para salão de manicure com pagamento via Mercado Pago e lembretes por WhatsApp.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend | Python + FastAPI |
| Banco de dados | PostgreSQL 15 |
| ORM | SQLAlchemy 2 + Alembic |
| Pagamento | Mercado Pago Checkout Pro |
| Mensagens | WhatsApp Business Cloud API |
| Email | SMTP / Resend / noop |

---

## Rodar localmente com Docker Compose

### 1. Copiar variáveis de ambiente

```bash
cp .env.example .env
```

> Edite `.env` com seus segredos. Em desenvolvimento, as chaves padrão funcionam para testes locais.

### 2. Subir os serviços

```bash
docker compose up --build
```

O container do backend executa automaticamente:
1. `alembic upgrade head` — cria as tabelas
2. `python seed.py` — cria admin e dados iniciais
3. `uvicorn` com hot-reload (dev)

### 3. Acessar

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Docs (dev) | http://localhost:8000/docs |

### Login admin padrão
- **Email:** admin@salao.com
- **Senha:** trocar123
- **IMPORTANTE:** Troque a senha assim que logar (há um aviso no dashboard)

---

## Migrations (Alembic)

```bash
# Dentro do container backend
docker compose exec backend alembic upgrade head

# Criar nova migration
docker compose exec backend alembic revision --autogenerate -m "descrição"

# Reverter 1 migration
docker compose exec backend alembic downgrade -1
```

---

## Seed manual

```bash
docker compose exec backend python seed.py
```

---

## Configurar Mercado Pago

1. Crie uma conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Crie um aplicativo e obtenha:
   - `MERCADOPAGO_ACCESS_TOKEN` — chave privada de acesso (TEST-xxx para sandbox)
   - `MERCADOPAGO_PUBLIC_KEY` — chave pública (no frontend)
3. Configure o webhook no painel do MP:
   - URL: `https://SEU_BACKEND/api/payments/mercadopago/webhook`
   - Evento: `payment`
4. Copie o segredo do webhook para `MERCADOPAGO_WEBHOOK_SECRET`

> Em desenvolvimento, use [ngrok](https://ngrok.com) para expor localhost:8000 ao MP.

---

## Configurar WhatsApp Business Cloud API

1. Acesse [Meta for Developers](https://developers.facebook.com)
2. Crie um aplicativo do tipo Business
3. Configure o WhatsApp Business:
   - Obtenha `WHATSAPP_PHONE_NUMBER_ID`
   - Gere `WHATSAPP_ACCESS_TOKEN` (token permanente em produção)
4. Crie templates de mensagem no Meta Business Manager:
   - **lembrete_cliente**: "Olá, {{1}}! Passando para lembrar do seu agendamento no salão às {{2}} de hoje. Até já!"
   - **lembrete_admin**: "Lembrete: {{1}} tem agendamento às {{2}}. WhatsApp: {{3}}."
5. Aguarde aprovação dos templates (1-2 dias úteis)
6. Configure `WHATSAPP_ADMIN_PHONE` com o número da dona do salão

---

## Configurar Email (recuperação de senha)

### Opção 1: SMTP (Gmail, etc.)
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@gmail.com
SMTP_PASSWORD=sua_senha_de_app
EMAIL_FROM=seu@gmail.com
```

### Opção 2: Resend (recomendado para produção)
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@seudominio.com
```

### Desenvolvimento (sem envio real)
```env
EMAIL_PROVIDER=noop
```
O link de redefinição aparece nos **logs do backend**.

---

## Deploy gratuito/barato

### 1. Banco de dados — Neon (gratuito)

1. Acesse [neon.tech](https://neon.tech) e crie uma conta
2. Crie um projeto e copie a `DATABASE_URL`
3. Formato: `postgresql://user:pass@host/dbname?sslmode=require`

### 2. Backend — Render (gratuito / $7/mês)

1. Acesse [render.com](https://render.com) e crie um Web Service
2. Conecte o repositório GitHub
3. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory:** `backend`
4. Adicione todas as variáveis de ambiente do `.env.example`
5. Configure `ENVIRONMENT=production`

> **Atenção:** O tier gratuito do Render hiberna após 15 min de inatividade. Para produção real, use o plano Starter ($7/mês).

### 3. Frontend — Vercel (gratuito)

1. Acesse [vercel.com](https://vercel.com)
2. Importe o repositório
3. Configure **Root Directory** como `frontend`
4. Adicione as variáveis:
   - `NEXT_PUBLIC_API_URL=https://seu-backend.onrender.com`
   - `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx`

### 4. Cron de lembretes — GitHub Actions (gratuito)

1. No repositório GitHub, vá em **Settings > Secrets > Actions**
2. Adicione:
   - `BACKEND_URL=https://seu-backend.onrender.com`
   - `CRON_SECRET=sua_cron_secret`
3. O workflow `.github/workflows/send-reminders.yml` já está configurado para rodar a cada 5 minutos

### 5. Configurações finais

```bash
# Gerar segredos seguros (rode localmente)
python -c "import secrets; print(secrets.token_hex(32))"  # JWT_SECRET
python -c "import secrets; print(secrets.token_hex(32))"  # CRON_SECRET
```

6. Configure `CORS_ALLOWED_ORIGINS=https://seu-app.vercel.app` no Render
7. Configure o webhook do Mercado Pago com a URL do backend em produção
8. Verifique HTTPS ativo (automático no Render e Vercel)

---

## Checklist de segurança pós-deploy

- [ ] Alterar a senha padrão do admin (admin@salao.com / trocar123)
- [ ] Usar `JWT_SECRET` aleatório e seguro (≥64 chars)
- [ ] Usar `CRON_SECRET` aleatório e seguro
- [ ] Configurar `CORS_ALLOWED_ORIGINS` apenas com o domínio do frontend
- [ ] Verificar `ENVIRONMENT=production`
- [ ] Verificar HTTPS nos dois serviços
- [ ] Configurar `MERCADOPAGO_WEBHOOK_SECRET`
- [ ] Nunca commitar o arquivo `.env` real

---

## LGPD — Dados coletados e tratamento

| Dado | Finalidade | Armazenamento |
|------|-----------|---------------|
| Nome | Identificação no agendamento | Banco de dados |
| Email | Login, recuperação de senha | Banco de dados |
| WhatsApp | Lembretes de agendamento | Banco de dados |
| Data/hora agendamento | Prestação do serviço | Banco de dados |
| Status de pagamento | Confirmação de reserva | Banco de dados |
| IP (hash SHA256) | Segurança e auditoria | Banco de dados |
| User-agent | Diagnóstico técnico | Banco de dados |

**Dados NÃO coletados:** dados de cartão (processados pelo Mercado Pago), documentos pessoais, endereço.

**Base legal:** Execução de contrato (art. 7º, V da LGPD) e consentimento explícito (art. 7º, I).

**Solicitação de exclusão:** Disponível na área do cliente em "Minha Conta > Exclusão de dados".

---

## Arquitetura

```
App-Luna/
├── backend/
│   ├── app/
│   │   ├── core/          # config, database, security, dependencies
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── repositories/  # database queries
│   │   ├── services/      # business logic
│   │   ├── routers/       # FastAPI routers (auth, client, admin, payments, jobs)
│   │   └── integrations/  # MercadoPago, WhatsApp, Email
│   ├── alembic/           # migrations
│   └── seed.py
├── frontend/
│   └── src/
│       ├── app/           # Next.js App Router pages
│       ├── components/    # UI + layout + admin components
│       ├── contexts/      # AuthContext
│       ├── lib/           # api.ts, utils.ts
│       └── types/         # TypeScript types
├── .github/workflows/     # GitHub Actions cron
└── docker-compose.yml
```
