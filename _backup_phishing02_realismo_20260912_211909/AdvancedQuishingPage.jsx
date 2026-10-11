import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Mail,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  X,
  XCircle,
} from "lucide-react";
import { simulationService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function QrCodeVisual() {
  const cells = [];

  for (let row = 0; row < 21; row += 1) {
    for (let col = 0; col < 21; col += 1) {
      const finder = (startRow, startCol) => {
        if (
          row < startRow ||
          row >= startRow + 7 ||
          col < startCol ||
          col >= startCol + 7
        ) {
          return null;
        }

        const outer =
          row === startRow ||
          row === startRow + 6 ||
          col === startCol ||
          col === startCol + 6;

        const inner =
          row >= startRow + 2 &&
          row <= startRow + 4 &&
          col >= startCol + 2 &&
          col <= startCol + 4;

        return outer || inner;
      };

      const a = finder(0, 0);
      const b = finder(0, 14);
      const c = finder(14, 0);

      let filled =
        ((row * 19 + col * 29 + row * col * 5) % 9) < 4;

      if (a !== null) filled = a;
      if (b !== null) filled = b;
      if (c !== null) filled = c;

      cells.push(
        <span
          key={`${row}-${col}`}
          className={`aspect-square ${
            filled ? "bg-slate-900" : "bg-white"
          }`}
        />
      );
    }
  }

  return (
    <div className="grid grid-cols-[repeat(21,minmax(0,1fr))] gap-[2px] rounded-xl bg-white p-3">
      {cells}
    </div>
  );
}

function EndSimulationModal({
  onCancel,
  onConfirm,
  busy,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="phishing02-end-title"
      >
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-600">
                Encerramento
              </p>

              <h2
                id="phishing02-end-title"
                className="mt-2 text-xl font-black text-slate-950"
              >
                Encerrar simulação?
              </h2>
            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-sm leading-6 text-slate-600">
            O percurso desta experiência será interrompido.
          </p>

          <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold leading-5 text-slate-600">
            Ao confirmar, a sessão temporária desta jornada será encerrada.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-400 disabled:opacity-50"
            >
              Continuar simulação
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Encerrar simulação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InspectionPanel({
  title,
  value,
  onClose,
}) {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            {title}
          </p>

          <p className="mt-2 break-all text-sm font-bold text-slate-800">
            {value}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"
          aria-label="Fechar informação"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function FinalSimulationState({
  state,
}) {
  return (
    <div className="bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            {state.kind === "safe" ? (
              <CheckCircle2 className="h-6 w-6 text-slate-600" />
            ) : (
              <ShieldAlert className="h-6 w-6 text-slate-600" />
            )}

            <div>
              <p className="font-black text-slate-950">
                {state.title}
              </p>

              <p className="text-xs text-slate-400">
                Ambiente simulado
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {state.loading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />

                <p className="text-sm font-semibold text-slate-700">
                  {state.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm leading-7 text-slate-700">
                {state.message}
              </p>

              {state.detail && (
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {state.detail}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FinalNavigation({
  onNext,
  onEnd,
}) {
  return (
    <div className="mx-auto mt-5 w-full max-w-6xl border-t border-slate-200 px-3 pt-5 pb-8 sm:px-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-sm font-bold text-slate-800">
          O seu percurso está a ser registado.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onEnd}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
          >
            <XCircle className="h-4 w-4" />
            Encerrar simulação
          </button>

          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Próxima simulação
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdvancedQuishingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [emailInspection, setEmailInspection] =
    useState(false);

  const [urlInspection, setUrlInspection] =
    useState(false);

  const [finalState, setFinalState] =
    useState(null);

  useEffect(() => {
    simulationService
      .get("phishing-02")
      .then(setSimulation)
      .catch((err) => {
        setError(
          err?.message ||
            "Não foi possível carregar a simulação."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function recordAction(
    action,
    stepId,
    interactionType,
    details = {}
  ) {
    if (busy) return false;

    setBusy(true);
    setError("");

    try {
      await simulationService.evaluate(
        "phishing-02",
        action,
        user?.id,
        stepId,
        interactionType,
        details
      );

      return true;
    } catch (err) {
      setError(
        err?.message ||
          "Não foi possível registar esta interacção."
      );

      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleEmailAction(action) {
    if (action === "inspect_sender") {
      const ok = await recordAction(
        action,
        "step_01",
        "inspect_sender"
      );

      if (ok) {
        setEmailInspection(true);
      }

      return;
    }

    if (action === "report") {
      const ok = await recordAction(
        action,
        "step_01",
        "report"
      );

      if (!ok) return;

      setFinalState({
        kind: "safe",
        title: "Mensagem encaminhada",
        message:
          "A mensagem foi encaminhada para análise de segurança.",
        detail:
          "O pedido foi recebido pelo sistema.",
      });

      return;
    }

    if (action === "open_link") {
      const ok = await recordAction(
        action,
        "step_01",
        "link"
      );

      if (ok) {
        setEmailInspection(false);
        setStep("mobile");
      }
    }
  }

  async function handleMobileAction(action) {
    if (action === "inspect_url") {
      const ok = await recordAction(
        action,
        "step_02",
        "inspect_url"
      );

      if (ok) {
        setUrlInspection(true);
      }

      return;
    }

    if (action === "open_link") {
      const ok = await recordAction(
        action,
        "step_02",
        "link"
      );

      if (ok) {
        setUrlInspection(false);
        setStep("login");
      }

      return;
    }

    if (action === "leave_page") {
      const ok = await recordAction(
        action,
        "step_02",
        "leave_page"
      );

      if (!ok) return;

      setFinalState({
        kind: "safe",
        title: "Sessão encerrada",
        message:
          "A página deixou de responder ao pedido de acesso.",
        detail:
          "A sessão móvel foi encerrada.",
      });

      return;
    }

    if (action === "report") {
      const ok = await recordAction(
        action,
        "step_02",
        "report"
      );

      if (!ok) return;

      setFinalState({
        kind: "safe",
        title: "Acesso encaminhado",
        message:
          "O endereço foi encaminhado para análise.",
        detail:
          "A sessão actual foi encerrada.",
      });
    }
  }

  async function handleLoginAction(
    action,
    details = {}
  ) {
    if (action === "inspect_url") {
      const ok = await recordAction(
        action,
        "step_03",
        "inspect_url"
      );

      if (ok) {
        setUrlInspection(true);
      }

      return;
    }

    if (action === "credentials") {
      const ok = await recordAction(
        action,
        "step_03",
        "credentials",
        {
          email_value: details.email_value || "",
          password_entered: true,
        }
      );

      if (!ok) return;

      setFinalState({
        kind: "danger",
        title: "A confirmar os seus dados...",
        message:
          "Estamos a confirmar os seus dados. Aguarde alguns instantes.",
        detail:
          "O pedido foi recebido pelo sistema.",
        loading: true,
      });

      window.setTimeout(() => {
        setFinalState({
          kind: "danger",
          title: "Serviço temporariamente indisponível",
          message:
            "A operação não pôde ser concluída neste momento. Tente novamente mais tarde.",
          detail:
            "A página deixou de responder ao pedido.",
          loading: false,
        });
      }, 1500);

      return;
    }

    if (action === "leave_page") {
      const ok = await recordAction(
        action,
        "step_03",
        "leave_page"
      );

      if (!ok) return;

      setFinalState({
        kind: "safe",
        title: "Sessão encerrada",
        message:
          "A sessão de autenticação foi encerrada.",
        detail:
          "Nenhuma operação adicional foi efectuada.",
      });

      return;
    }

    if (action === "report") {
      const ok = await recordAction(
        action,
        "step_03",
        "report"
      );

      if (!ok) return;

      setFinalState({
        kind: "safe",
        title: "Pedido encaminhado",
        message:
          "A página foi encaminhada para análise.",
        detail:
          "A sessão actual foi encerrada.",
      });
    }
  }

  async function submitCredentials(event) {
    event.preventDefault();

    if (busy) return;

    await handleLoginAction(
      "credentials",
      {
        email_value: email,
      }
    );
  }

  async function finishJourney() {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await simulationService.evaluate(
        "phishing-02",
        "finish",
        user?.id,
        "step_04",
        "finish"
      );
    } catch (err) {
      setError(
        err?.message ||
          "Não foi possível registar o encerramento da experiência."
      );
    } finally {
      setBusy(false);
    }
  }

  function handleNextSimulation() {
    navigate("/student/simulacoes/phishing-03");
  }

  function handleEndSimulation() {
    setError("");
    setShowEndModal(true);
  }

  const [showEndModal, setShowEndModal] =
    useState(false);

  async function confirmEndSimulation() {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await simulationService.clearPhishingResult(
        user?.id
      );

      setShowEndModal(false);
      navigate("/student/simulacoes");
    } catch (err) {
      setError(
        err?.message ||
          "Não foi possível encerrar a experiência."
      );
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!finalState) return;

    finishJourney();
  }, [finalState]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-5 sm:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

            <p className="mt-4 text-sm text-slate-500">
              A preparar a experiência...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="min-h-screen bg-slate-50 p-5 sm:p-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-200 bg-red-50 p-8">
          <ShieldAlert className="h-9 w-9 text-red-600" />

          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Simulação indisponível
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-700">
            {error ||
              "Não foi possível carregar o Phishing 02."}
          </p>
        </div>
      </div>
    );
  }

  const mobile = simulation.mobile || {};
  const login = simulation.login || {};

  return (
    <div className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() =>
              navigate("/student/simulacoes")
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar às simulações
          </button>

          <span className="text-xs font-bold text-slate-400">
            Phishing 02
          </span>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
                Phishing 02 · QR Code
              </p>

              <h1 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
                {simulation.title}
              </h1>
            </div>

            <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
              Ambiente SICSI III
            </span>
          </div>
        </div>

        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 sm:px-7">
            {finalState ? (
              <CheckCircle2 className="h-5 w-5 text-slate-600" />
            ) : step === "email" ? (
              <Mail className="h-5 w-5 text-blue-600" />
            ) : step === "mobile" ? (
              <Smartphone className="h-5 w-5 text-blue-600" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-blue-600" />
            )}

            <div>
              <p className="font-black text-slate-950">
                {finalState
                  ? "Ambiente simulado"
                  : step === "email"
                    ? "Caixa de entrada"
                    : step === "mobile"
                      ? "Navegador móvel"
                      : "Portal académico"}
              </p>

              <p className="text-xs text-slate-400">
                {finalState
                  ? "Estado actual"
                  : "Interacção disponível"}
              </p>
            </div>
          </div>

          {finalState ? (
            <FinalSimulationState state={finalState} />
          ) : step === "email" ? (
            <div className="p-6 sm:p-8">
              <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_230px]">
                <div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Remetente
                    </p>

                    <p className="mt-2 break-all text-sm font-bold text-slate-900">
                      {simulation.sender}
                    </p>

                    <p className="mt-5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Assunto
                    </p>

                    <p className="mt-2 text-lg font-black text-slate-950">
                      {simulation.subject}
                    </p>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm leading-7 text-slate-700">
                      {simulation.message}
                    </p>

                    {emailInspection && (
                      <InspectionPanel
                        title="Remetente"
                        value={simulation.sender}
                        onClose={() =>
                          setEmailInspection(false)
                        }
                      />
                    )}

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleEmailAction(
                            "inspect_sender"
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 disabled:opacity-50"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Analisar
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleEmailAction("report")
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                      >
                        <ShieldAlert className="h-4 w-4" />
                        Denunciar
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleEmailAction(
                            "open_link"
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        <QrCode className="h-4 w-4" />
                        Abrir acesso móvel
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-blue-600" />

                    <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                      QR Code
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl bg-white p-3 shadow-sm">
                    <QrCodeVisual />
                  </div>
                </div>
              </div>
            </div>
          ) : step === "mobile" ? (
            <div className="bg-slate-50 p-6 sm:p-8">
              <div className="mx-auto max-w-md overflow-hidden rounded-[2rem] border border-slate-300 bg-white shadow-xl">
                <div className="flex items-center justify-between bg-slate-950 px-5 py-3 text-xs text-white">
                  <span>09:41</span>
                  <span>Portal</span>
                  <span>5G</span>
                </div>

                <div className="p-5">
                  <div className="rounded-2xl bg-blue-600 p-5 text-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-100">
                      {mobile.banner}
                    </p>

                    <h2 className="mt-2 text-2xl font-black">
                      {mobile.page_title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-blue-100">
                      {mobile.message}
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Endereço
                    </p>

                    <p className="mt-2 break-all text-xs font-bold text-slate-700">
                      {mobile.browser_url}
                    </p>
                  </div>

                  {urlInspection && (
                    <InspectionPanel
                      title="Endereço"
                      value={mobile.browser_url}
                      onClose={() =>
                        setUrlInspection(false)
                      }
                    />
                  )}

                  <div className="mt-4 grid gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        handleMobileAction(
                          "inspect_url"
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 disabled:opacity-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Verificar endereço
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        handleMobileAction(
                          "open_link"
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      Continuar
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        handleMobileAction(
                          "leave_page"
                        )
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-400 disabled:opacity-50"
                    >
                      Sair da página
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        handleMobileAction("report")
                      }
                      className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                    >
                      Denunciar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-6 sm:p-8">
              <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-200 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />

                    <div>
                      <p className="font-black text-slate-950">
                        {login.title}
                      </p>

                      <p className="text-xs text-slate-400">
                        Ambiente simulado
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={submitCredentials}
                  className="p-6"
                >
                  <p className="text-sm leading-6 text-slate-600">
                    {login.helper}
                  </p>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Endereço
                        </p>

                        <p className="mt-2 break-all text-xs font-bold text-slate-700">
                          {mobile.browser_url}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleLoginAction(
                            "inspect_url"
                          )
                        }
                        className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:border-blue-400 hover:text-blue-700 disabled:opacity-50"
                      >
                        Verificar
                      </button>
                    </div>
                  </div>

                  {urlInspection && (
                    <InspectionPanel
                      title="Endereço"
                      value={mobile.browser_url}
                      onClose={() =>
                        setUrlInspection(false)
                      }
                    />
                  )}

                  <label className="mt-5 block">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                      Endereço de correio electrónico
                    </span>

                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      autoComplete="off"
                      placeholder="nome@exemplo.com"
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 caret-blue-600 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>

                  <label className="mt-4 block">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                      Palavra-passe
                    </span>

                    <input
                      type="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      autoComplete="off"
                      placeholder="Introduza a palavra-passe"
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 caret-blue-600 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {login.submit_label}
                  </button>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        handleLoginAction(
                          "leave_page"
                        )
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-400 disabled:opacity-50"
                    >
                      Sair sem autenticar
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        handleLoginAction("report")
                      }
                      className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                    >
                      Denunciar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {error && (
            <div className="border-t border-red-100 bg-red-50 px-6 py-4">
              <p className="text-sm leading-6 text-red-700">
                {error}
              </p>
            </div>
          )}
        </section>

        {finalState && (
          <FinalNavigation
            onNext={handleNextSimulation}
            onEnd={handleEndSimulation}
          />
        )}

        {!finalState && (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleEndSimulation}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
            >
              <XCircle className="h-4 w-4" />
              Encerrar simulação
            </button>
          </div>
        )}
      </div>

      {showEndModal && (
        <EndSimulationModal
          onCancel={() => setShowEndModal(false)}
          onConfirm={confirmEndSimulation}
          busy={busy}
        />
      )}
    </div>
  );
}