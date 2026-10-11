import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  QrCode,
  RefreshCw,
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

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold leading-5 text-slate-600">
              Ao confirmar, a sessão temporária desta jornada será encerrada.
            </p>
          </div>

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
  children,
  onClose,
}) {
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            {title}
          </p>

          <div className="mt-3">
            {children}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SystemPage({
  title,
  subtitle,
  message,
  detail,
  loading = false,
  icon = "system",
}) {
  return (
    <div className="bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            {loading ? (
              <LoaderCircle className="h-6 w-6 animate-spin text-blue-600" />
            ) : icon === "success" ? (
              <CheckCircle2 className="h-6 w-6 text-slate-600" />
            ) : icon === "danger" ? (
              <ShieldAlert className="h-6 w-6 text-slate-600" />
            ) : (
              <Globe2 className="h-6 w-6 text-slate-600" />
            )}

            <div>
              <p className="font-black text-slate-950">
                {title}
              </p>

              <p className="text-xs text-slate-400">
                {subtitle}
              </p>
            </div>
          </div>

          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 sm:inline-flex">
            Portal
          </span>
        </div>

        <div className="p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold leading-7 text-slate-800">
              {message}
            </p>

            {detail && (
              <p className="mt-3 text-xs leading-6 text-slate-500">
                {detail}
              </p>
            )}
          </div>
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
    <div className="mx-auto mt-5 w-full max-w-6xl border-t border-slate-200 px-3 pb-8 pt-5 sm:px-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-sm font-bold text-slate-800">
          O seu percurso está a ser registado.
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          A experiência actual terminou. Pode avançar para a próxima
          experiência ou encerrar a jornada.
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

  const [emailInspection, setEmailInspection] =
    useState(false);

  const [urlInspection, setUrlInspection] =
    useState(false);

  const [scenarioPage, setScenarioPage] =
    useState(null);

  const [scenarioPageDone, setScenarioPageDone] =
    useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [showEndModal, setShowEndModal] =
    useState(false);

  const [finishSent, setFinishSent] =
    useState(false);

  useEffect(() => {
    let active = true;

    simulationService
      .get("phishing-02")
      .then((data) => {
        if (!active) return;
        setSimulation(data);
      })
      .catch((err) => {
        if (!active) return;

        setError(
          err?.message ||
            "Não foi possível carregar a simulação."
        );
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

  function finishScenarioLater() {
    window.setTimeout(() => {
      setScenarioPageDone(true);
    }, 1200);
  }

  async function handleEmailInspect() {
    const ok = await recordAction(
      "inspect_sender",
      "step_01",
      "inspect_sender"
    );

    if (!ok) return;

    setEmailInspection(true);
  }

  async function handleEmailOpen() {
    const ok = await recordAction(
      "open_link",
      "step_01",
      "link"
    );

    if (!ok) return;

    setEmailInspection(false);
    setStep("mobile");
  }

  async function handleEmailReport() {
    const ok = await recordAction(
      "report",
      "step_01",
      "report"
    );

    if (!ok) return;

    setStep("email");
    setScenarioPage({
      kind: "success",
      loading: true,
      title: "A processar a comunicação",
      subtitle: "Centro de mensagens",
      message:
        "A sua comunicação está a ser encaminhada para o serviço responsável.",
      detail:
        "O pedido está a ser processado.",
    });

    window.setTimeout(() => {
      setScenarioPage({
        kind: "success",
        loading: false,
        title: "Comunicação recebida",
        subtitle: "Centro de mensagens",
        message:
          "A comunicação foi recebida pelo sistema.",
        detail:
          "O pedido ficou registado e a sessão actual foi encerrada.",
      });

      finishScenarioLater();
    }, 1500);
  }

  async function handleMobileInspect() {
    const ok = await recordAction(
      "inspect_url",
      "step_02",
      "inspect_url"
    );

    if (!ok) return;

    setUrlInspection(true);
  }

  async function handleMobileContinue() {
    const ok = await recordAction(
      "open_link",
      "step_02",
      "link"
    );

    if (!ok) return;

    setUrlInspection(false);
    setStep("login");
  }

  async function handleMobileLeave() {
    const ok = await recordAction(
      "leave_page",
      "step_02",
      "leave_page"
    );

    if (!ok) return;

    setScenarioPage({
      kind: "success",
      loading: true,
      title: "A terminar a sessão",
      subtitle: "Navegador móvel",
      message:
        "A ligação com o portal está a ser encerrada.",
      detail:
        "Aguarde enquanto o pedido é processado.",
    });

    window.setTimeout(() => {
      setScenarioPage({
        kind: "success",
        loading: false,
        title: "Sessão encerrada",
        subtitle: "Navegador móvel",
        message:
          "A sessão foi terminada e a ligação com o portal foi encerrada.",
        detail:
          "A página actual deixou de estar disponível.",
      });

      finishScenarioLater();
    }, 1400);
  }

  async function handleMobileReport() {
    const ok = await recordAction(
      "report",
      "step_02",
      "report"
    );

    if (!ok) return;

    setScenarioPage({
      kind: "success",
      loading: true,
      title: "A enviar o pedido",
      subtitle: "Navegador móvel",
      message:
        "O pedido está a ser encaminhado para o serviço responsável.",
      detail:
        "A comunicação permanece aberta enquanto o pedido é processado.",
    });

    window.setTimeout(() => {
      setScenarioPage({
        kind: "success",
        loading: false,
        title: "Pedido recebido",
        subtitle: "Navegador móvel",
        message:
          "O pedido foi recebido pelo serviço responsável.",
        detail:
          "A sessão actual foi encerrada.",
      });

      finishScenarioLater();
    }, 1500);
  }

  async function handleLoginInspect() {
    const ok = await recordAction(
      "inspect_url",
      "step_03",
      "inspect_url"
    );

    if (!ok) return;

    setUrlInspection(true);
  }

  async function submitCredentials(event) {
    event.preventDefault();

    if (busy) return;

    const ok = await recordAction(
      "credentials",
      "step_03",
      "credentials",
      {
        email_value: email,
        password_entered: true,
      }
    );

    if (!ok) return;

    setUrlInspection(false);

    setScenarioPage({
      kind: "danger",
      loading: true,
      title: "A confirmar os seus dados",
      subtitle: "Portal do Estudante",
      message:
        "Estamos a confirmar os seus dados. Aguarde alguns instantes.",
      detail:
        "O pedido foi recebido pelo serviço de autenticação.",
    });

    window.setTimeout(() => {
      setScenarioPage({
        kind: "danger",
        loading: false,
        title: "Serviço temporariamente indisponível",
        subtitle: "Portal do Estudante",
        message:
          "Pedimos desculpa, mas a página está temporariamente indisponível.",
        detail:
          "Não foi possível concluir o pedido neste momento. Tente novamente mais tarde.",
      });

      finishScenarioLater();
    }, 1800);
  }

  async function handleLoginLeave() {
    const ok = await recordAction(
      "leave_page",
      "step_03",
      "leave_page"
    );

    if (!ok) return;

    setScenarioPage({
      kind: "success",
      loading: true,
      title: "A terminar a sessão",
      subtitle: "Portal do Estudante",
      message:
        "A sessão está a ser encerrada.",
      detail:
        "Aguarde enquanto a ligação é terminada.",
    });

    window.setTimeout(() => {
      setScenarioPage({
        kind: "success",
        loading: false,
        title: "Sessão terminada",
        subtitle: "Portal do Estudante",
        message:
          "A sessão foi terminada com sucesso.",
        detail:
          "A ligação com o portal foi encerrada.",
      });

      finishScenarioLater();
    }, 1300);
  }

  async function handleLoginReport() {
    const ok = await recordAction(
      "report",
      "step_03",
      "report"
    );

    if (!ok) return;

    setScenarioPage({
      kind: "success",
      loading: true,
      title: "A encaminhar o pedido",
      subtitle: "Portal do Estudante",
      message:
        "A página está a ser encaminhada para análise.",
      detail:
        "O pedido permanece em processamento.",
    });

    window.setTimeout(() => {
      setScenarioPage({
        kind: "success",
        loading: false,
        title: "Pedido recebido",
        subtitle: "Portal do Estudante",
        message:
          "A página foi encaminhada para análise.",
        detail:
          "A sessão actual foi encerrada pelo sistema.",
      });

      finishScenarioLater();
    }, 1500);
  }

  useEffect(() => {
    if (!scenarioPageDone || finishSent) return;

    let active = true;

    async function finishSimulation() {
      try {
        await simulationService.evaluate(
          "phishing-02",
          "finish",
          user?.id,
          "step_04",
          "finish"
        );

        if (active) {
          setFinishSent(true);
        }
      } catch (err) {
        if (active) {
          setError(
            err?.message ||
              "Não foi possível concluir o registo da experiência."
          );
        }
      }
    }

    finishSimulation();

    return () => {
      active = false;
    };
  }, [scenarioPageDone, finishSent, user?.id]);

  function handleNextSimulation() {
    navigate("/student/simulacoes/phishing-03");
  }

  function handleEndSimulation() {
    setShowEndModal(true);
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-5 sm:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
            <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-blue-600" />

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
            Phishing 02 · QR Code
          </span>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4 shadow-sm sm:px-5">
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
            {scenarioPage ? (
              <Clock3 className="h-5 w-5 text-slate-600" />
            ) : step === "email" ? (
              <Mail className="h-5 w-5 text-blue-600" />
            ) : step === "mobile" ? (
              <Smartphone className="h-5 w-5 text-blue-600" />
            ) : (
              <LockKeyhole className="h-5 w-5 text-blue-600" />
            )}

            <div>
              <p className="font-black text-slate-950">
                {scenarioPage
                  ? scenarioPage.title
                  : step === "email"
                    ? "Caixa de entrada"
                    : step === "mobile"
                      ? "Navegador móvel"
                      : "Portal do Estudante"}
              </p>

              <p className="text-xs text-slate-400">
                {scenarioPage
                  ? scenarioPage.subtitle
                  : "Ambiente SICSI III"}
              </p>
            </div>
          </div>

          {scenarioPage ? (
            <SystemPage
              title={scenarioPage.title}
              subtitle={scenarioPage.subtitle}
              message={scenarioPage.message}
              detail={scenarioPage.detail}
              loading={scenarioPage.loading}
              icon={scenarioPage.kind}
            />
          ) : step === "email" ? (
            <div className="p-6 sm:p-8">
              <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_230px]">
                <div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
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

                      <Mail className="h-5 w-5 shrink-0 text-blue-600" />
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm leading-7 text-slate-700">
                      {simulation.message}
                    </p>

                    {emailInspection && (
                      <InspectionPanel
                        title="Detalhes da mensagem"
                        onClose={() =>
                          setEmailInspection(false)
                        }
                      >
                        <div className="space-y-3">
                          <div className="rounded-xl bg-white p-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                              De
                            </p>

                            <p className="mt-1 break-all text-xs font-bold text-slate-700">
                              {simulation.sender}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white p-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                              Destino
                            </p>

                            <p className="mt-1 break-all text-xs font-bold text-slate-700">
                              {simulation.link_target}
                            </p>
                          </div>
                        </div>
                      </InspectionPanel>
                    )}

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={handleEmailInspect}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 disabled:opacity-50"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Analisar
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={handleEmailReport}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                      >
                        <ShieldAlert className="h-4 w-4" />
                        Denunciar
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={handleEmailOpen}
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
                      Código de acesso
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl bg-white p-3 shadow-sm">
                    <QrCodeVisual />
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-slate-500" />

                      <p className="text-xs font-bold text-slate-600">
                        Acesso através de dispositivo móvel
                      </p>
                    </div>
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

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Endereço actual
                        </p>

                        <p className="mt-2 break-all text-xs font-bold text-slate-700">
                          {mobile.browser_url}
                        </p>
                      </div>
                    </div>
                  </div>

                  {urlInspection && (
                    <InspectionPanel
                      title="Informações da ligação"
                      onClose={() =>
                        setUrlInspection(false)
                      }
                    >
                      <div className="space-y-3">
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                            Endereço
                          </p>

                          <p className="mt-1 break-all text-xs font-bold text-slate-700">
                            {mobile.browser_url}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                            Estado da ligação
                          </p>

                          <p className="mt-1 text-xs font-bold text-slate-700">
                            Ligação disponível
                          </p>
                        </div>
                      </div>
                    </InspectionPanel>
                  )}

                  <div className="mt-4 grid gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleMobileInspect}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 disabled:opacity-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Verificar endereço
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleMobileContinue}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      Continuar
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleMobileLeave}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-400 disabled:opacity-50"
                    >
                      Sair da página
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleMobileReport}
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
                    <LockKeyhole className="h-6 w-6 text-blue-600" />

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

                  <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Endereço da página
                        </p>

                        <p className="mt-2 break-all text-xs font-bold text-slate-700">
                          {mobile.browser_url}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={handleLoginInspect}
                        className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:border-blue-400 hover:text-blue-700 disabled:opacity-50"
                      >
                        Verificar
                      </button>
                    </div>
                  </div>

                  {urlInspection && (
                    <InspectionPanel
                      title="Informações da ligação"
                      onClose={() =>
                        setUrlInspection(false)
                      }
                    >
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Endereço
                        </p>

                        <p className="mt-1 break-all text-xs font-bold text-slate-700">
                          {mobile.browser_url}
                        </p>
                      </div>
                    </InspectionPanel>
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

                    <p className="mt-2 text-[11px] text-slate-400">
                      A palavra-passe permanece apenas neste campo de treino.
                    </p>
                  </label>

                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {busy ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        A processar...
                      </>
                    ) : (
                      <>
                        {login.submit_label}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleLoginLeave}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-400 disabled:opacity-50"
                    >
                      Sair sem autenticar
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleLoginReport}
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

        {scenarioPageDone && (
          <FinalNavigation
            onNext={handleNextSimulation}
            onEnd={handleEndSimulation}
          />
        )}

        {!scenarioPageDone && !scenarioPage && (
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