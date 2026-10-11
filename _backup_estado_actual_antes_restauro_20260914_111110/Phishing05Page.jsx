import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  Globe,
  KeyRound,
  LockKeyhole,
  Mail,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { simulationService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const SIMULATION_ID = "phishing-05";

const EMAIL = {
  sender: "IT Universitário",
  senderEmail: "it@suporte-academico.example",
  subject: "Atualização obrigatória da conta",
  message:
    "Para manter o acesso aos serviços académicos, confirme a sua palavra-passe antes das 18:00.",
  linkText: "Atualizar palavra-passe",
  linkTarget: "https://suporte-academico.example/login",
};

const LOGIN_PAGE = {
  brand: "Serviços Académicos",
  title: "Actualizar palavra-passe",
  description:
    "Confirme os dados da sua conta para manter o acesso aos serviços académicos.",
  url: "https://suporte-academico.example/login",
};

function BrowserFrame({ children, url }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <LockKeyhole className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate text-xs text-slate-500">{url}</span>
        </div>
      </div>

      {children}
    </div>
  );
}

function Inspection({ onClose }) {
  return (
    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
            <Search className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-bold text-blue-950">
              Análise do endereço
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-800">
              O domínio apresentado deve ser comparado com o endereço
              oficial conhecido pela instituição. O cadeado, por si só,
              não confirma a legitimidade do serviço.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-blue-500 transition hover:bg-blue-100"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-blue-100 bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Domínio apresentado
          </p>
          <p className="mt-1 break-all text-xs font-bold text-slate-700">
            suporte-academico.example
          </p>
        </div>

        <div className="rounded-lg border border-blue-100 bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Origem
          </p>
          <p className="mt-1 text-xs font-bold text-amber-700">
            Link recebido por correio electrónico
          </p>
        </div>

        <div className="rounded-lg border border-blue-100 bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Pedido
          </p>
          <p className="mt-1 text-xs font-bold text-slate-700">
            Palavra-passe da conta
          </p>
        </div>

        <div className="rounded-lg border border-blue-100 bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Pressão temporal
          </p>
          <p className="mt-1 text-xs font-bold text-red-600">
            Antes das 18:00
          </p>
        </div>
      </div>
    </div>
  );
}

function FinalResult({ safe, onFinish }) {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
          safe
            ? "bg-emerald-50 text-emerald-600"
            : "bg-red-50 text-red-600"
        }`}
      >
        {safe ? (
          <CheckCircle2 className="h-7 w-7" />
        ) : (
          <AlertTriangle className="h-7 w-7" />
        )}
      </div>

      <div className="mt-5 text-center">
        <p
          className={`text-xs font-bold uppercase tracking-[0.16em] ${
            safe ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {safe ? "Resposta segura" : "Exposição de risco"}
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          {safe
            ? "Reconheceu uma tentativa de obtenção de credenciais."
            : "A comunicação conduziu-o para um pedido de credenciais."}
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          {safe
            ? "A resposta adequada é não introduzir a palavra-passe e denunciar a comunicação através de um canal apropriado."
            : "Num cenário real, entregar uma palavra-passe a uma página recebida por uma mensagem inesperada poderia permitir o comprometimento da conta."}
        </p>
      </div>

      <div
        className={`mt-6 rounded-xl border p-4 ${
          safe
            ? "border-emerald-100 bg-emerald-50"
            : "border-red-100 bg-red-50"
        }`}
      >
        <div className="flex items-start gap-3">
          {safe ? (
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          )}

          <p className="text-sm leading-6 text-slate-700">
            {safe
              ? "Uma instituição pode comunicar alterações de conta, mas pedidos inesperados de palavra-passe devem ser tratados com extrema cautela e confirmados por canais oficiais."
              : "Nunca reutilize ou introduza a sua palavra-passe numa página cuja legitimidade não tenha sido confirmada."}
          </p>
        </div>
      </div>

      <div className="mt-7 flex justify-end">
        <button
          type="button"
          onClick={onFinish}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          Encerrar simulação
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Phishing05Page() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [step, setStep] = useState("email");
  const [inspection, setInspection] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;

    simulationService
      .get(SIMULATION_ID)
      .then((data) => {
        if (active) {
          setSimulation(data);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError?.message ||
              "Não foi possível carregar a simulação."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function recordAction(
    action,
    stepId,
    interactionType,
    metadata = {}
  ) {
    if (busy) return false;

    setBusy(true);
    setError("");

    try {
      await simulationService.evaluate(
        SIMULATION_ID,
        action,
        user?.id,
        stepId,
        interactionType,
        metadata
      );

      return true;
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Não foi possível registar esta interacção."
      );
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function inspectSender() {
    const ok = await recordAction(
      "inspect_sender",
      "step_01",
      "inspect_sender",
      {
        surface: "email",
        target: "sender",
      }
    );

    if (ok) {
      setInspection(true);
    }
  }

  async function openLogin() {
    const ok = await recordAction(
      "open_link",
      "step_01",
      "link",
      {
        target: "password_update",
        url: EMAIL.linkTarget,
      }
    );

    if (ok) {
      setInspection(false);
      setStep("login");
    }
  }

  async function reportEmail() {
    const ok = await recordAction(
      "report",
      "step_01",
      "report",
      {
        reason: "unexpected_password_request",
      }
    );

    if (ok) {
      setResult("safe");
    }
  }

  async function inspectLoginUrl() {
    const ok = await recordAction(
      "inspect_url",
      "step_02",
      "inspect_url",
      {
        surface: "login",
        url: LOGIN_PAGE.url,
      }
    );

    if (ok) {
      setInspection(true);
    }
  }

  async function submitCredentials(event) {
    event.preventDefault();

    if (!email.trim() || !password) {
      return;
    }

    const ok = await recordAction(
      "credentials",
      "step_02",
      "credentials",
      {
        email_entered: Boolean(email.trim()),
        password_entered: true,
      }
    );

    if (ok) {
      setResult("danger");
    }
  }

  async function leaveLogin() {
    const ok = await recordAction(
      "leave_page",
      "step_02",
      "leave_page"
    );

    if (ok) {
      setResult("safe");
    }
  }

  async function finishSimulation() {
    await recordAction(
      "finish",
      "step_03",
      "finish",
      {
        completed: true,
        final_sequence_position: 5,
      }
    );

    navigate("/student/simulacoes/phishing/resultado-final");
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-500">
            A preparar a experiência final...
          </p>
        </div>
      </div>
    );
  }

  if (error && !simulation) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h2 className="font-bold text-red-900">
                Não foi possível carregar a simulação
              </h2>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <FinalResult
          safe={result === "safe"}
          onFinish={finishSimulation}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/student/simulacoes/phishing-04")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Simulação anterior
        </button>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
              Phishing · 05/05
            </span>

            <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700">
              Difícil
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {simulation?.title || "Conta académica em risco"}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Uma comunicação aparentemente institucional afirma que a sua
            conta precisa de ser actualizada antes de um prazo limite.
            Analise a mensagem antes de agir.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
            05
          </span>
          <span>de</span>
          <span>05</span>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {step === "email" && (
        <BrowserFrame url="https://correio.academico.example/caixa-de-entrada">
          <div className="p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Mail className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Caixa de correio
                </p>
                <p className="text-[10px] text-slate-400">
                  Comunicação institucional recebida
                </p>
              </div>
            </div>

            <div className="max-w-4xl">
              <div className="border-b border-slate-100 pb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Assunto
                </p>

                <h2 className="mt-2 text-lg font-bold text-slate-900">
                  {EMAIL.subject}
                </h2>

                <div className="mt-4 flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Mail className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {EMAIL.sender}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {EMAIL.senderEmail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="py-6">
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    <div>
                      <p className="text-xs font-bold text-red-900">
                        Prazo indicado na mensagem
                      </p>
                      <p className="mt-1 text-sm font-bold text-red-700">
                        Confirmação necessária antes das 18:00
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-600">
                  {EMAIL.message}
                </p>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">
                        Pedido de actualização
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        A mensagem encaminha-o para uma página onde deverá
                        confirmar a palavra-passe.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={openLogin}
                      className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      Actualizar palavra-passe
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={inspectSender}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Inspeccionar remetente
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={reportEmail}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Denunciar mensagem
                  </button>
                </div>

                {inspection && (
                  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <Search className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                      <div className="flex-1">
                        <p className="text-sm font-bold text-blue-950">
                          Inspecção do remetente
                        </p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-lg bg-white p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              Nome apresentado
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-700">
                              IT Universitário
                            </p>
                          </div>

                          <div className="rounded-lg bg-white p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              Endereço
                            </p>
                            <p className="mt-1 break-all text-xs font-bold text-slate-700">
                              it@suporte-academico.example
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-blue-800">
                          A identidade apresentada deve ser confirmada por
                          um canal institucional conhecido. Não confie
                          apenas no nome apresentado pelo remetente.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setInspection(false)}
                        className="text-blue-500"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </BrowserFrame>
      )}

      {step === "login" && (
        <BrowserFrame url={LOGIN_PAGE.url}>
          <div className="flex justify-center bg-slate-50 px-4 py-10 sm:px-6">
            <div className="w-full max-w-md">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex justify-center">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                    <LockKeyhole className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    {LOGIN_PAGE.brand}
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    {LOGIN_PAGE.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {LOGIN_PAGE.description}
                  </p>
                </div>

                <form
                  className="mt-7 space-y-4"
                  onSubmit={submitCredentials}
                >
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">
                      Endereço de correio electrónico
                    </label>

                    <input
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      autoComplete="off"
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="nome@instituicao.example"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">
                      Palavra-passe
                    </label>

                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Introduza a sua palavra-passe"
                      />

                      <Eye className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-300" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      busy ||
                      !email.trim() ||
                      !password
                    }
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Confirmar dados
                  </button>
                </form>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={inspectLoginUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-bold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Analisar endereço
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={leaveLogin}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-bold text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Sair da página
                  </button>
                </div>

                {inspection && (
                  <Inspection onClose={() => setInspection(false)} />
                )}
              </div>
            </div>
          </div>
        </BrowserFrame>
      )}

      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p className="text-xs leading-5 text-blue-800">
            <strong>Objectivo da experiência:</strong> reconhecer uma
            tentativa de recolha de credenciais mesmo quando a mensagem
            parece vir de um serviço institucional.
          </p>
        </div>
      </div>
    </div>
  );
}