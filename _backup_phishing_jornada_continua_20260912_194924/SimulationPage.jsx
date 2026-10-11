import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Flag,
  Globe,
  Info,
  Mail,
  MoreHorizontal,
  Paperclip,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { simulationService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
const PHISHING_SEQUENCE = [
  "phishing-01",
  "phishing-02",
  "phishing-03",
  "phishing-04",
  "phishing-05",
];

function getNextPhishingSimulationId(simulationId) {
  const index =
    PHISHING_SEQUENCE.indexOf(simulationId);

  if (index < 0) {
    return null;
  }

  return PHISHING_SEQUENCE[index + 1] || null;
}

const emailSceneImage =
  "https://cybersecfill.com/storage/2026/03/ChatGPT-Image-Mar-6-2026-05_49_26-PM-1024x683.png";

function SenderDetails({ email, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
              Detalhes da mensagem
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              Informações do remetente
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-6">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Nome apresentado
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              {email.sender}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Endereço de correio electrónico
            </p>

            <p className="mt-1 break-all text-sm font-bold text-slate-900">
              {email.sender_email}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Assunto
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              {email.subject}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 p-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportOutcome({ onContinue, buttonLabel = "Continuar a experiência" }) {
  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/30">

      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
            <Mail className="h-4 w-4" />
          </div>

          <span className="text-sm font-bold text-slate-700">
            Centro de segurança
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-9">
        <div className="mx-auto max-w-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
            Denúncia recebida
          </p>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            A mensagem foi encaminhada para análise.
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            A ocorrência foi registada e encaminhada para a equipa
            responsável pela análise de mensagens suspeitas.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Estado
              </p>

              <p className="mt-2 text-sm font-bold text-slate-900">
                Caso encaminhado
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-5">
              <p className="text-xs font-black uppercase tracking-wide text-blue-500">
                Apoio
              </p>

              <p className="mt-2 text-sm font-bold text-slate-900">
                segurança@sicsi.local
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

              <div>
                <p className="text-sm font-black text-amber-900">
                  Recomendação
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Não responda a este e-mail até à intervenção da nossa
                  equipa. Não forneça informação adicional ao remetente.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            {buttonLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <footer className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center">
        <p className="text-[11px] text-slate-400">
          Ambiente de treino do SICSI III
        </p>
      </footer>
    </div>
  );
}

function EmailEnvironment({ step, onInteraction }) {
  const email = step.email || {};
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/30 sm:rounded-[2rem]">

        {/* BARRA SUPERIOR */}
        <div className="flex h-14 items-center gap-3 border-b border-slate-200 bg-[#f7f9fc] px-4 sm:h-16 sm:px-5">
          <div className="flex shrink-0 items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-full bg-red-400 shadow-sm"
              aria-hidden="true"
            />
            <span
              className="h-3 w-3 rounded-full bg-amber-400 shadow-sm"
              aria-hidden="true"
            />
            <span
              className="h-3 w-3 rounded-full bg-emerald-400 shadow-sm"
              aria-hidden="true"
            />
          </div>

          <div className="ml-1 flex min-w-0 flex-1 items-center rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Mail className="mr-2 h-4 w-4 shrink-0 text-slate-400" />

            <span className="truncate text-xs font-semibold text-slate-500">
              Correio electrónico
            </span>
          </div>

          <button
            type="button"
            className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 sm:block"
            aria-label="Mais opções"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <div className="grid lg:grid-cols-[190px_minmax(0,1fr)]">

          {/* PASTAS */}
          <aside className="hidden border-r border-slate-100 bg-[#f8fafc] p-4 lg:block">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-left text-xs font-bold text-white shadow-sm"
            >
              <Mail className="h-4 w-4" />
              Caixa de entrada
            </button>

            <button
              type="button"
              className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800"
            >
              <span>Importantes</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px]">
                2
              </span>
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800"
            >
              Enviados
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800"
            >
              Lixo
            </button>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-3.5">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />

                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Caixa de entrada
                </p>
              </div>

              <p className="mt-2 text-xs font-semibold text-slate-600">
                1 nova mensagem
              </p>
            </div>
          </aside>

          {/* MENSAGEM */}
          <main className="min-w-0">

            {/* CABEÇALHO DA MENSAGEM */}
            <div className="border-b border-slate-100 px-4 py-5 sm:px-7 sm:py-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-red-600">
                      Urgente
                    </span>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                      Remetente externo
                    </span>
                  </div>

                  <h1 className="mt-3 text-lg font-black leading-tight text-slate-950 sm:text-xl">
                    {email.subject}
                  </h1>
                </div>

                <span className="shrink-0 text-xs text-slate-400">
                  Hoje, 09:42
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="mt-5 flex w-full items-center gap-3 rounded-2xl p-1 text-left transition hover:bg-slate-50"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <UserRound className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {email.sender}
                  </p>

                  <p className="break-all text-xs text-slate-400">
                    {email.sender_email}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-blue-600">
                  Ver detalhes
                  <ChevronDown className="h-3.5 w-3.5" />
                </div>
              </button>
            </div>

            {/* CORPO */}
            <div className="px-4 py-5 sm:px-7 sm:py-7">

              {/* IMAGEM */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img
                  src={emailSceneImage}
                  alt=""
                  className="h-40 w-full object-cover object-center sm:h-48"
                />
              </div>

              {/* TEXTO */}
              <div className="mt-6 max-w-3xl">
                <p className="text-sm leading-7 text-slate-600">
                  {email.message}
                </p>
              </div>

              {/* SINALIZADORES */}
              <div className="mt-6 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-500">
                  <Info className="h-3.5 w-3.5 text-blue-500" />
                  Pedido de confirmação
                </div>

                {email.link_text && (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-500">
                    <Globe className="h-3.5 w-3.5 text-blue-500" />
                    Ligação externa
                  </div>
                )}

                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-500">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  Acção imediata pedida
                </div>
              </div>

              {/* LIGAÇÃO DA MENSAGEM */}
              {email.link_text && (
                <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <Globe className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
                        Ligação da mensagem
                      </p>

                      <p className="mt-1 truncate text-sm font-bold text-slate-800">
                        {email.link_text}
                      </p>

                      <p className="mt-1 break-all text-[11px] text-slate-400">
                        {email.link_target}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onInteraction({
                          id:
                            email.link_text ===
                            "Abrir formulário de candidatura"
                              ? "open_form"
                              : "open_link",
                          type: "link",
                        })
                      }
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/15 transition hover:bg-blue-700"
                    >
                      Abrir ligação
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* RODAPÉ DO E-MAIL */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-sm font-semibold text-slate-600">
                  Com os melhores cumprimentos,
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  Equipa de Atendimento
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Serviço de apoio ao utilizador
                </p>
              </div>

              {/* ACÇÕES */}
              <footer className="mt-7 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setShowDetails(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                >
                  <UserRound className="h-4 w-4" />
                  Ver detalhes
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onInteraction({
                      id: "report_email",
                      type: "report",
                    })
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 sm:ml-auto"
                >
                  <Flag className="h-4 w-4" />
                  Denunciar mensagem
                </button>
              </footer>
            </div>
          </main>
        </div>

        {/* FOOTER DO CORREIO */}
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-center">
          <p className="text-[10px] font-semibold text-slate-400">
            Serviço de correio electrónico • Mensagem recebida hoje
          </p>
        </div>
      </div>

      {showDetails && (
        <SenderDetails
          email={email}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}

function FakeLoginEnvironment({ step, onInteraction }) {
  const page = step.page || {};

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canContinue =
    email.trim().length > 0 &&
    password.trim().length > 0;

  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/30">

      {/* BARRA DO NAVEGADOR SIMULADO */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-[#f7f9fc] px-4 py-3 sm:px-5">
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>

        <div className="flex min-w-0 flex-1 items-center rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <span className="mr-2 text-xs text-slate-400">
            🔒
          </span>

          <span className="truncate text-xs font-medium text-slate-500">
            {page.url ||
              "https://seguranca-verificacao.example/confirmar"}
          </span>
        </div>
      </div>

      {/* PÁGINA */}
      <div className="bg-slate-50 px-4 py-7 sm:px-8 sm:py-10">
        <div className="mx-auto w-full max-w-md">

          {/* IDENTIDADE DO SERVIÇO */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8">

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-950">
                    {page.brand || "Segurança Online"}
                  </p>

                  <p className="text-[10px] font-semibold text-slate-400">
                    Área protegida
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-wide text-emerald-700">
                  Ligado
                </span>
              </div>
            </div>

            <div className="mt-7 border-t border-slate-100 pt-7">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
                Área do utilizador
              </p>

              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                {page.title ||
                  "Confirmar a sua conta"}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {page.description ||
                  "Para continuar, confirme os dados da sua conta."}
              </p>
            </div>

            <div className="mt-7 space-y-5">

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Endereço de correio electrónico
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="off"
                  placeholder="nome@exemplo.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Palavra-passe
                </label>

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    placeholder="Introduza a palavra-passe"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword
                      ? "Ocultar"
                      : "Mostrar"}
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={!canContinue}
                onClick={() =>
                  onInteraction({
                    id: "submit_credentials",
                    type: "credentials",
                    metadata: {
                      email_entered:
                        Boolean(email.trim()),
                      password_entered:
                        Boolean(password.trim()),
                    },
                  })
                }
                className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {page.button || "Confirmar"}
              </button>

              <button
                type="button"
                onClick={() =>
                  onInteraction({
                    id: "leave_page",
                    type: "safe",
                  })
                }
                className="w-full rounded-xl px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              >
                Sair sem continuar
              </button>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <p className="text-[10px] leading-5 text-slate-400">
                Ambiente de autenticação simulado para treino de segurança.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
            Ligação protegida
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-100 bg-white px-5 py-4 text-center">
        <p className="text-[10px] font-semibold text-slate-400">
          Centro de segurança • Ambiente de formação
        </p>
      </footer>
    </div>
  );
}

function LoginSuccessOutcome({ onContinue, buttonLabel = "Continuar a experiência" }) {
  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/30">

      {/* BARRA DO NAVEGADOR */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-[#f7f9fc] px-4 py-3 sm:px-5">
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>

        <div className="flex min-w-0 flex-1 items-center rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <span className="mr-2 shrink-0 text-xs text-slate-400">
            🔒
          </span>

          <span className="truncate text-xs font-medium text-slate-500">
            conta.segura.example
          </span>
        </div>

        <div className="hidden shrink-0 rounded-lg p-2 text-slate-400 sm:block">
          <span className="text-lg leading-none">⋯</span>
        </div>
      </div>

      {/* CABEÇALHO DO SERVIÇO */}
      <div className="border-b border-slate-100 bg-white px-5 py-4 sm:px-7">
        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/15">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-black text-slate-950">
                Conta Segura
              </p>

              <p className="text-[10px] font-semibold text-slate-400">
                Área de gestão da conta
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-semibold text-slate-500">
              Sessão iniciada
            </span>
          </div>
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="bg-slate-50 px-4 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-3xl">

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/35">

            {/* CABEÇALHO DA ÁREA DE CONTA */}
            <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
                    Área pessoal
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    A minha conta
                  </p>
                </div>

                <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">
                  Sessão activa
                </div>
              </div>
            </div>

            {/* MENSAGEM DO SERVIÇO */}
            <div className="px-6 py-8 sm:px-10 sm:py-10">

              <div className="mx-auto max-w-2xl text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm">
                  <AlertTriangle className="h-8 w-8" />
                </div>

                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
                  Serviço temporariamente indisponível
                </p>

                <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Obrigado por iniciares sessão.
                </h1>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                  A tua sessão foi recebida, mas neste momento não
                  conseguimos carregar a área da tua conta.
                </p>

                <div className="mx-auto mt-7 max-w-xl rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-left">
                  <p className="text-sm font-black text-amber-900">
                    Tenta novamente mais tarde.
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Não é necessário efectuar qualquer outra acção neste momento.
                  </p>
                </div>

                {/* INFORMAÇÃO DO PEDIDO */}
                <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Pedido
                    </p>

                    <p className="mt-2 text-sm font-bold text-slate-900">
                      Acesso recebido
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Ref. CS-2026-0911
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Próximo passo
                    </p>

                    <p className="mt-2 text-sm font-bold text-slate-900">
                      Tentar novamente mais tarde
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      O pedido permanece registado
                    </p>
                  </div>
                </div>

                {/* SUPORTE */}
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-left">
                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Mail className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-900">
                        Precisas de ajuda?
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Contacta o apoio através de
                        {" "}
                        <span className="font-bold text-slate-700">
                          suporte@conta-segura.example
                        </span>
                        .
                      </p>
                    </div>
                  </div>
                </div>

                {/* FINAL DA EXPERIÊNCIA */}
                <div className="mt-8 border-t border-slate-100 pt-7">

                  <div className="flex flex-col items-center">

                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
                      Experiência concluída
                    </p>

                    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                      A experiência terminou. Podes agora consultar a análise
                      completa das decisões que tomaste.
                    </p>

                    <button
                      type="button"
                      onClick={onContinue}
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:w-auto"
                    >
                      Ver os meus feedbacks
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RODAPÉ DA ÁREA */}
            <footer className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center">
              <p className="text-[10px] font-semibold text-slate-400">
                Conta Segura • Serviço de apoio ao utilizador
              </p>
            </footer>
          </div>
        </div>
      </div>

      {/* RODAPÉ DO SERVIÇO */}
      <footer className="border-t border-slate-100 bg-white px-5 py-4 text-center">
        <p className="text-[10px] font-semibold text-slate-400">
          Ambiente simulado de formação • SICSI III
        </p>
      </footer>
    </div>
  );
}
function LinkUnavailableOutcome({
  onContinue,
  buttonLabel = "Continuar a experiência",
}) {
  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/30">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
            <Globe className="h-4 w-4" />
          </div>

          <span className="text-sm font-bold text-slate-700">
            Ambiente de navegação
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-9">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-amber-600">
            Página temporariamente indisponível
          </p>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            A página está temporariamente indisponível.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
            Não foi possível concluir o acesso à página solicitada.
            Este ambiente faz parte de uma simulação de segurança.
          </p>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-left">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

              <div>
                <p className="text-sm font-black text-blue-900">
                  O seu percurso está sendo registado.
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-800">
                  Continue as simulações para concluir a jornada de Phishing.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            {buttonLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <footer className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center">
        <p className="text-[11px] text-slate-400">
          Ambiente de treino do SICSI III
        </p>
      </footer>
    </div>
  );
}
function ConsequenceOutcome({
  onContinue,
  buttonLabel = "Continuar a experiência",
}) {
  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/30">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
          </div>

          <span className="text-sm font-bold text-slate-700">
            Consequência da acção
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-9">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-amber-600">
            Consequência da simulação
          </p>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            A acção foi registada.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
            Esta experiência apresenta agora uma consequência
            simulada. A avaliação do seu comportamento ficará
            reservada para o relatório final.
          </p>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-left">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

              <div>
                <p className="text-sm font-black text-blue-900">
                  O seu percurso está sendo registado.
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-800">
                  Continue as simulações para concluir a jornada de Phishing.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            {buttonLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <footer className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center">
        <p className="text-[11px] text-slate-400">
          Ambiente de treino do SICSI III
        </p>
      </footer>
    </div>
  );
}

export default function SimulationPage() {
  const { simulationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [simulation, setSimulation] =
    useState(null);

  const [stepIndex, setStepIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [outcome, setOutcome] =
    useState(null);

  useEffect(() => {
    let active = true;

    async function loadSimulation() {
      try {
        setLoading(true);
        setError("");
        setOutcome(null);
        setStepIndex(0);

        const data =
          await simulationService.get(
            simulationId
          );

        if (!active) return;

        setSimulation(data);
      } catch (requestError) {
        if (!active) return;

        setError(
          requestError?.message ||
            "Não foi possível carregar a simulação."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSimulation();

    return () => {
      active = false;
    };
  }, [simulationId]);

  const currentStep =
    simulation?.steps?.[stepIndex] ||
    null;

  async function handleInteraction(
    interaction
  ) {
    if (!currentStep) return;

    try {
      const response =
        await simulationService.evaluate(
          simulationId,
          interaction.id,
          user?.id,
          currentStep.id,
          interaction.type
        );

      /*
       * A experiência muda de ambiente sem revelar
       * ainda a avaliação do comportamento.
       */

      if (
        interaction.id ===
        "report_email"
      ) {
        setOutcome("report");
        return;
      }

      if (
        interaction.id ===
        "submit_credentials"
      ) {
        setOutcome("login-success");
        return;
      }

      if (
        interaction.id ===
          "submit_personal_data" ||
        interaction.id ===
          "submit_mfa"
      ) {
        setOutcome("danger");
        return;
      }

      const nextStepId =
        response?.next_step;

      if (nextStepId) {
        const nextIndex =
          simulation.steps.findIndex(
            (step) =>
              step.id === nextStepId
          );

        if (nextIndex >= 0) {
          setStepIndex(nextIndex);
          return;
        }
      }

      if (
        stepIndex <
        simulation.steps.length - 1
      ) {
        setStepIndex(
          (value) => value + 1
        );
      }
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Não foi possível continuar a experiência."
      );
    }
  }

  async function completeSimulation() {
    try {
      await simulationService.evaluate(
        simulationId,
        "finish",
        user?.id,
        "step_03",
        "finish"
      );

      const nextSimulationId =
        getNextPhishingSimulationId(
          simulationId
        );

      if (nextSimulationId) {
        navigate(
          `/student/simulacoes/${nextSimulationId}`
        );
        return;
      }

      navigate(
        "/student/simulacoes/phishing/resultado-final"
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Não foi possível concluir a experiência."
      );
    }
  }
  function finishOutcome() {
    completeSimulation();
  }

  const isFinalPhishingSimulation =
    simulationId === "phishing-05";

  const completionButtonLabel =
    isFinalPhishingSimulation
      ? "Encerrar simulação"
      : "Próxima simulação";
  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="mt-4 text-sm text-slate-500">
            A preparar o ambiente...
          </p>
        </div>
      </div>
    );
  }

  if (
    error ||
    !simulation ||
    !currentStep
  ) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <ShieldAlert className="mx-auto h-10 w-10 text-red-500" />

        <h1 className="mt-4 text-2xl font-black text-slate-950">
          Não foi possível abrir a simulação
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {error ||
            "Simulação indisponível."}
        </p>

        <Link
          to="/student/simulacoes"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
        >
          Voltar às simulações
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-3 pb-10 pt-5 sm:px-5 sm:pt-7 lg:px-8">

      <div className="mb-4 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
              Jornada de Phishing
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              Cinco experiências · análise global no final
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {PHISHING_SEQUENCE.map(
              (id, index) => {
                const currentIndex =
                  PHISHING_SEQUENCE.indexOf(
                    simulationId
                  );

                const completed =
                  currentIndex > index;

                const current =
                  currentIndex === index;

                return (
                  <div
                    key={id}
                    className={[
                      "h-2.5 rounded-full transition-all",
                      current
                        ? "w-9 bg-blue-600"
                        : completed
                          ? "w-6 bg-blue-300"
                          : "w-6 bg-slate-200",
                    ].join(" ")}
                    title={`Phishing ${String(index + 1).padStart(2, "0")}`}
                  />
                );
              }
            )}
          </div>
        </div>
      </div>
      {/* VOLTAR — discreto */}
      <div className="mb-3">
        <Link
          to="/student/simulacoes"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-400 transition hover:bg-white hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar às simulações
        </Link>
      </div>

      {outcome === "report" ? (
        <ReportOutcome
          onContinue={completeSimulation}
          buttonLabel={completionButtonLabel}
        />
      ) : outcome === "link-unavailable" ? (
        <LinkUnavailableOutcome
          onContinue={completeSimulation}
          buttonLabel={completionButtonLabel}
        />
      ) : outcome === "login-success" ? (
        <LoginSuccessOutcome
          onContinue={completeSimulation}
          buttonLabel={completionButtonLabel}
        />
      ) : (
        <>
          {currentStep.type === "email" && (
            <EmailEnvironment
              step={currentStep}
              onInteraction={
                handleInteraction
              }
            />
          )}

          {currentStep.type === "fake_login" && (
            <FakeLoginEnvironment
              step={currentStep}
              onInteraction={
                handleInteraction
              }
            />
          )}

          {currentStep.type === "consequence" && (
            <ConsequenceOutcome
              onContinue={completeSimulation}
              buttonLabel={completionButtonLabel}
            />
          )}
        </>
      )}
    </div>
  );
}