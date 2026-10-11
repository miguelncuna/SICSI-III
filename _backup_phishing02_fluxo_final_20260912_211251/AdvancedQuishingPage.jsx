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

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold leading-5 text-amber-900">
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

function CompletionOutcome({
  onNext,
  onEnd,
}) {
  return (
    <div className="p-6 sm:p-8">
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
              Experiência concluída
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              O percurso desta simulação terminou.
            </h2>

            <p className="mt-3 text-sm leading-7 text-emerald-900">
              O seu percurso está a ser registado.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-200 bg-white p-5">
          <p className="text-sm leading-6 text-slate-700">
            No final das cinco simulações de phishing, será apresentado o
            relatório geral com as suas decisões, dados envolvidos,
            consequências simuladas e recomendações.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

function ConsequenceEnvironment({
  consequenceType,
  onFinish,
  busy,
}) {
  const dangerous =
    consequenceType === "credentials";

  return (
    <div className="bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <ShieldAlert
              className={`h-6 w-6 ${
                dangerous
                  ? "text-amber-600"
                  : "text-slate-600"
              }`}
            />

            <div>
              <p className="font-black text-slate-950">
                Portal do Estudante
              </p>

              <p className="text-xs text-slate-400">
                Ambiente simulado
              </p>
            </div>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
            SICSI III
          </span>
        </div>

        <div className="p-6">
          <div
            className={`rounded-2xl border p-5 ${
              dangerous
                ? "border-amber-200 bg-amber-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
              Estado
            </p>

            <h2 className="mt-2 text-xl font-black text-slate-950">
              {dangerous
                ? "Acesso processado"
                : "Pedido processado"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-700">
              {dangerous
                ? "A sessão foi recebida pelo ambiente académico."
                : "A operação foi recebida pelo ambiente académico."}
            </p>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={onFinish}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            Concluir experiência
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
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [emailInspected, setEmailInspected] = useState(false);
  const [urlInspected, setUrlInspected] = useState(false);
  const [consequenceType, setConsequenceType] =
    useState("safe");

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
          "Não foi possível registar esta decisão."
      );

      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleEmailAction(
    action,
    interactionType
  ) {
    const ok = await recordAction(
      action,
      "step_01",
      interactionType
    );

    if (!ok) return;

    if (action === "inspect_sender" || action === "inspect") {
      setEmailInspected(true);
      setStep("mobile");
      return;
    }

    if (action === "report") {
      setConsequenceType("safe");
      setStep("consequence");
      return;
    }

    if (action === "open_link") {
      setStep("mobile");
    }
  }

  async function handleMobileAction(
    action,
    interactionType
  ) {
    const ok = await recordAction(
      action,
      "step_02",
      interactionType
    );

    if (!ok) return;

    if (action === "inspect_url") {
      setUrlInspected(true);
      setStep("login");
      return;
    }

    if (action === "open_link") {
      setStep("login");
      return;
    }

    if (
      action === "leave_page" ||
      action === "report"
    ) {
      setConsequenceType("safe");
      setStep("consequence");
    }
  }

  async function handleLoginAction(
    action,
    interactionType,
    details = {}
  ) {
    const ok = await recordAction(
      action,
      "step_03",
      interactionType,
      details
    );

    if (!ok) return;

    if (action === "inspect_url") {
      setUrlInspected(true);
      return;
    }

    if (action === "credentials") {
      setConsequenceType("credentials");
      setStep("consequence");
      return;
    }

    if (
      action === "leave_page" ||
      action === "report"
    ) {
      setConsequenceType("safe");
      setStep("consequence");
    }
  }

  async function submitCredentials(event) {
    event.preventDefault();

    if (busy) return;

    await handleLoginAction(
      "credentials",
      "credentials",
      {
        email_value: email,
        password_entered: true,
      }
    );
  }

  async function finishExperience() {
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

      setCompleted(true);
    } catch (err) {
      setError(
        err?.message ||
          "Não foi possível concluir esta experiência."
      );
    } finally {
      setBusy(false);
    }
  }

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
        <div className="mx-auto max-w-6xl">
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

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
              Phishing 02 · QR Code
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {simulation.title}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              {simulation.context}
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-blue-700">
            {simulation.difficulty}
          </span>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
              <div className="flex items-center gap-3">
                {completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : step === "email" ? (
                  <Mail className="h-5 w-5 text-blue-600" />
                ) : step === "mobile" ? (
                  <Smartphone className="h-5 w-5 text-blue-600" />
                ) : step === "login" ? (
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-amber-600" />
                )}

                <div>
                  <p className="font-black text-slate-950">
                    {completed
                      ? "Experiência concluída"
                      : step === "email"
                        ? "Caixa de entrada"
                        : step === "mobile"
                          ? "Navegador móvel"
                          : step === "login"
                            ? "Portal académico"
                            : "Consequência simulada"}
                  </p>

                  <p className="text-xs text-slate-400">
                    Ambiente SICSI III
                  </p>
                </div>
              </div>

              <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 sm:inline-flex">
                Experiência interactiva
              </span>
            </div>

            {completed ? (
              <CompletionOutcome
                onNext={handleNextSimulation}
                onEnd={handleEndSimulation}
              />
            ) : step === "email" ? (
              <div className="p-6 sm:p-8">
                <div className="grid gap-6 md:grid-cols-[1fr_220px]">
                  <div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Remetente
                      </p>

                      <p className="mt-2 break-all text-sm font-bold text-slate-900">
                        {simulation.sender}
                      </p>

                      <p className="mt-5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
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

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            handleEmailAction(
                              "inspect_sender",
                              "inspect_sender"
                            )
                          }
                          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition disabled:opacity-50 ${
                            emailInspected
                              ? "border-slate-400 bg-slate-100 text-slate-600"
                              : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700"
                          }`}
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Analisar
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            handleEmailAction(
                              "report",
                              "report"
                            )
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
                              "open_link",
                              "link"
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
                        QR Code recebido
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

                    <div className="mt-4 grid gap-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleMobileAction(
                            "inspect_url",
                            "inspect_url"
                          )
                        }
                        className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition disabled:opacity-50 ${
                          urlInspected
                            ? "border-slate-400 bg-slate-100 text-slate-600"
                            : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700"
                        }`}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Verificar endereço
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleMobileAction(
                            "open_link",
                            "link"
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
                            "leave_page",
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
                          handleMobileAction(
                            "report",
                            "report"
                          )
                        }
                        className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                      >
                        Denunciar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : step === "login" ? (
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
                        <div>
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
                              "inspect_url",
                              "inspect_url"
                            )
                          }
                          className={`shrink-0 rounded-lg border px-3 py-2 text-[11px] font-bold transition disabled:opacity-50 ${
                            urlInspected
                              ? "border-slate-400 bg-slate-100 text-slate-600"
                              : "border-slate-300 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700"
                          }`}
                        >
                          Verificar
                        </button>
                      </div>
                    </div>

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
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </label>

                    <label className="mt-4 block">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                        Palavra-passe
                      </span>

                      <input
                        type="password"
                        autoComplete="off"
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                            "leave_page",
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
                          handleLoginAction(
                            "report",
                            "report"
                          )
                        }
                        className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                      >
                        Denunciar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <ConsequenceEnvironment
                consequenceType={consequenceType}
                onFinish={finishExperience}
                busy={busy}
              />
            )}

            {error && (
              <div className="border-t border-red-100 bg-red-50 px-6 py-4">
                <p className="text-sm leading-6 text-red-700">
                  {error}
                </p>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">
                Phishing 02
              </p>

              <h2 className="mt-2 text-xl font-black text-slate-950">
                O QR Code para o portal académico
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Experiência simulada de quishing.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Percurso
              </p>

              <div className="mt-4 space-y-2">
                {[
                  ["email", "Mensagem"],
                  ["mobile", "Acesso móvel"],
                  ["login", "Autenticação"],
                  ["consequence", "Consequência"],
                ].map(([value, label], index) => {
                  const current =
                    !completed && step === value;

                  const done =
                    completed ||
                    (step === "mobile" &&
                      value === "email") ||
                    (step === "login" &&
                      ["email", "mobile"].includes(value)) ||
                    (step === "consequence" &&
                      ["email", "mobile", "login"].includes(value));

                  return (
                    <div
                      key={value}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${
                        current
                          ? "border-blue-200 bg-blue-50"
                          : done
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                          current
                            ? "bg-blue-600 text-white"
                            : done
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <span
                        className={`text-sm font-bold ${
                          current
                            ? "text-blue-900"
                            : done
                              ? "text-emerald-900"
                              : "text-slate-500"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">
                Jornada de phishing
              </p>

              <p className="mt-2 text-sm leading-6 text-blue-950">
                2 de 5 experiências
              </p>
            </div>
          </aside>
        </div>

        {!completed && (
          <div className="mx-auto mt-6 flex max-w-6xl justify-end">
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