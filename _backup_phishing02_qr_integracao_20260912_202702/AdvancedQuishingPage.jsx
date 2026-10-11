import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Mail,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
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

export default function AdvancedQuishingPage() {

  const navigate = useNavigate();
  const { user } = useAuth();

  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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

  async function act(
    action,
    stepId,
    interactionType,
    details = {}
  ) {

    if (busy) return;

    setBusy(true);
    setError("");

    try {

      const result =
        await simulationService.evaluate(
          "phishing-02",
          action,
          user?.id,
          stepId,
          interactionType,
          details
        );

      if (result?.completed) {
        navigate(
          "/student/simulacoes/phishing-02/resultado"
        );
        return;
      }

      if (
        action === "open_link" &&
        step === "email"
      ) {
        setStep("mobile");
      }
      else if (
        action === "open_link" &&
        step === "mobile"
      ) {
        setStep("login");
      }

    }
    catch (err) {

      setError(
        err?.message ||
          "Não foi possível registar esta decisão."
      );

    }
    finally {
      setBusy(false);
    }
  }

  async function submitCredentials(event) {

    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setError("");

    try {

      const result =
        await simulationService.evaluate(
          "phishing-02",
          "credentials",
          user?.id,
          "step_03",
          "credentials",
          {
            email_value: email,
          }
        );

      if (result?.completed) {
        navigate(
          "/student/simulacoes/phishing-02/resultado"
        );
        return;
      }

      setStep("consequence");

    }
    catch (err) {

      setError(
        err?.message ||
          "Não foi possível concluir esta acção."
      );

    }
    finally {
      setBusy(false);
    }
  }

  async function finish() {

    await act(
      "finish",
      "step_04",
      "finish"
    );
  }

  if (loading) {

    return (
      <div className="p-5 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-200/40">
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
      <div className="p-5 sm:p-8">
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
              Phishing avançado
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

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">

              <div className="flex items-center gap-3">

                {step === "email" ? (
                  <Mail className="h-5 w-5 text-blue-600" />
                ) : (
                  <Smartphone className="h-5 w-5 text-blue-600" />
                )}

                <div>
                  <p className="font-black text-slate-950">
                    {step === "email"
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

            {step === "email" && (

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

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            act(
                              "inspect",
                              "step_01",
                              "inspect"
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700 disabled:opacity-50"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Analisar
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            act(
                              "report",
                              "step_01",
                              "report"
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                        >
                          <ShieldAlert className="h-4 w-4" />
                          Denunciar
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            act(
                              "open_link",
                              "step_01",
                              "link"
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          <QrCode className="h-4 w-4" />
                          Abrir acesso
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

                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      O código faz parte do cenário simulado. A decisão de o utilizar é registada pela experiência.
                    </p>

                  </div>

                </div>

              </div>
            )}

            {step === "mobile" && (

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
                          act(
                            "inspect_url",
                            "step_02",
                            "inspect_url"
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Verificar endereço
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          act(
                            "open_link",
                            "step_02",
                            "link"
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        Continuar
                        <ArrowRight className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          act(
                            "leave_page",
                            "step_02",
                            "leave_page"
                          )
                        }
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:border-slate-400"
                      >
                        Sair da página
                      </button>

                    </div>

                  </div>

                </div>

              </div>
            )}

            {step === "login" && (

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
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />

                    </label>

                    <label className="mt-4 block">

                      <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                        Palavra-passe
                      </span>

                      <input
                        type="password"
                        autoComplete="off"
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />

                    </label>

                    <button
                      type="submit"
                      disabled={busy}
                      className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {login.submit_label}
                    </button>

                  </form>

                </div>

              </div>
            )}

            {step === "consequence" && (

              <div className="p-6 sm:p-8">

                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">

                  <ShieldAlert className="h-8 w-8 text-amber-600" />

                  <h2 className="mt-4 text-2xl font-black text-slate-950">
                    A experiência avançou para a consequência
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-amber-900">
                    {simulation.consequence}
                  </p>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={finish}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    Terminar experiência
                    <ArrowRight className="h-4 w-4" />
                  </button>

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

          <aside className="space-y-6">

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">

              <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">
                Objectivo
              </p>

              <h2 className="mt-2 text-xl font-black text-slate-950">
                Não confie no código apenas porque parece legítimo.
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Nesta experiência, a ameaça muda de superfície:
                mensagem, QR Code, navegador móvel e autenticação.
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

                  const active =
                    step === value;

                  return (
                    <div
                      key={value}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${
                        active
                          ? "border-blue-200 bg-blue-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >

                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                          active
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <span
                        className={`text-sm font-bold ${
                          active
                            ? "text-blue-900"
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

          </aside>

        </div>

      </div>

    </div>
  );
}