import { useEffect, useState } from "react";
import {
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import { simulationService } from "../../services/api";

export function SimulationsPage() {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    simulationService
      .getAll()
      .then((data) => {
        if (active) {
          setSimulations(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Não foi possível carregar as simulações.");
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

  if (loading) {
    return (
      <div className="p-5 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-500">
            A preparar simulações...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-blue-400">
          Aprendizagem prática
        </p>

        <h1 className="mt-2 text-3xl font-black sm:text-4xl">
          Simulações
        </h1>

        <p className="mt-2 max-w-2xl text-slate-500">
          Pratique a identificação e resposta a situações
          reais de risco digital num ambiente totalmente seguro.
        </p>

        <div className="mt-8 flex items-start gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
          <ShieldAlert className="mt-1 shrink-0 text-blue-500" />

          <div>
            <h2 className="font-bold">
              Ambiente seguro de simulação
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Todas as situações são fictícias. Nenhuma acção
              executada aqui afecta contas, emails ou serviços reais.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {!error && simulations.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <ShieldAlert className="mx-auto text-slate-500" size={32} />
            <p className="mt-4 font-semibold text-slate-300">
              Não existem simulações disponíveis.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {simulations.map((simulation) => (
            <Link
              key={simulation.id}
              to={`/student/simulacoes/${simulation.id}`}
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500/50"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-500">
                  {simulation.category === "Phishing" ? (
                    <Mail size={24} />
                  ) : (
                    <ShieldAlert size={24} />
                  )}
                </div>

                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                  {simulation.difficulty}
                </span>
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-wider text-blue-400">
                {simulation.category}
              </p>

              <h2 className="mt-2 text-xl font-bold">
                {simulation.title}
              </h2>

              <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                {simulation.subject ||
                  simulation.scenario ||
                  simulation.message}
              </p>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-400">
                  Iniciar cenário
                </span>

                <ArrowRight
                  size={18}
                  className="text-blue-500 transition group-hover:translate-x-1"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SimulationPlayerPage({ simulationId }) {
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(
    localStorage.getItem("sicsi_user") || "null"
  );

  useEffect(() => {
    let active = true;

    simulationService
      .get(simulationId)
      .then((data) => {
        if (active) {
          setSimulation(data);
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
  }, [simulationId]);

  async function evaluate(action) {
    setSelectedAction(action);
    setSubmitting(true);

    try {
      const data = await simulationService.evaluate(
        simulationId,
        action,
        user?.id
      );

      setResult(data);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        A preparar o cenário...
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="p-8 text-red-300">
        Simulação não encontrada.
      </div>
    );
  }

  const isPhishing = simulation.category === "Phishing";

  return (
    <div className="p-5 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/student/simulacoes"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300"
        >
          ← Voltar às simulações
        </Link>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
            {simulation.category}
          </p>

          <h1 className="mt-2 text-3xl font-black">
            {simulation.title}
          </h1>
        </div>

        {isPhishing ? (
          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 bg-slate-950 px-5 py-4">
              <div className="flex items-center gap-3">
                <Mail className="text-blue-500" />

                <div>
                  <p className="font-bold">
                    Caixa de entrada
                  </p>

                  <p className="text-xs text-slate-500">
                    Ambiente simulado
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-500">
                  De
                </p>

                <p className="mt-1 font-semibold">
                  {simulation.sender}
                </p>

                <p className="mt-5 text-sm text-slate-500">
                  Assunto
                </p>

                <p className="mt-1 font-bold">
                  {simulation.subject}
                </p>

                <div className="my-6 h-px bg-slate-800" />

                <p className="leading-7 text-slate-300">
                  {simulation.message}
                </p>

                <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Link da mensagem
                  </p>

                  <p className="mt-2 break-all text-sm text-blue-300">
                    {simulation.link_target}
                  </p>
                </div>
              </div>

              {!result && (
                <div className="mt-8">
                  <h2 className="font-bold">
                    O que faria nesta situação?
                  </h2>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => evaluate("inspect")}
                      className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-left hover:border-blue-500 disabled:opacity-60"
                    >
                      <strong>Inspeccionar</strong>
                      <span className="mt-1 block text-xs text-slate-500">
                        Analisar remetente e link.
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => evaluate("report")}
                      className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-left hover:border-blue-500 disabled:opacity-60"
                    >
                      <strong>Denunciar</strong>
                      <span className="mt-1 block text-xs text-slate-500">
                        Marcar a mensagem como suspeita.
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => evaluate("open")}
                      className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-left hover:border-red-500 disabled:opacity-60"
                    >
                      <strong>Abrir link</strong>
                      <span className="mt-1 block text-xs text-slate-500">
                        Prosseguir para o endereço.
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {result && (
                <div
                  className={`mt-8 rounded-2xl border p-6 ${
                    result.correct
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-amber-500/30 bg-amber-500/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {result.correct ? (
                      <CheckCircle2 className="shrink-0 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="shrink-0 text-amber-400" />
                    )}

                    <div>
                      <h2 className="font-bold">
                        {result.correct
                          ? "Boa decisão!"
                          : "Atenção à sua decisão"}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {result.feedback}
                      </p>

                      <div className="mt-4 rounded-xl bg-slate-950/60 p-4">
                        <p className="text-sm leading-6 text-slate-400">
                          {result.explanation}
                        </p>
                      </div>

                      {!result.correct && (
                        <button
                          type="button"
                          onClick={() => {
                            setResult(null);
                            setSelectedAction("");
                          }}
                          className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold hover:bg-blue-500"
                        >
                          Tentar novamente
                        </button>
                      )}

                      {result.correct && (
                        <Link
                          to="/student/simulacoes"
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold hover:bg-blue-500"
                        >
                          Próxima simulação
                          <ArrowRight size={17} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
            <div className="rounded-2xl bg-slate-950 p-6">
              <p className="leading-7 text-slate-300">
                {simulation.scenario}
              </p>
            </div>

            {!result && (
              <div className="mt-7">
                <h2 className="font-bold">
                  Qual seria a sua decisão?
                </h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => evaluate(simulation.safe_action)}
                    className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-left hover:border-blue-500 disabled:opacity-60"
                  >
                    Tomar uma decisão segura
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => evaluate("act")}
                    className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-left hover:border-red-500 disabled:opacity-60"
                  >
                    Prosseguir sem verificar
                  </button>
                </div>
              </div>
            )}

            {result && (
              <div className="mt-7 rounded-2xl border border-slate-800 p-6">
                <h2 className="font-bold">
                  {result.correct
                    ? "Boa decisão!"
                    : "Atenção"}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {result.feedback}
                </p>

                <p className="mt-4 text-sm leading-6 text-slate-400">
                  {result.explanation}
                </p>

                {result.correct && (
                  <Link
                    to="/student/simulacoes"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold"
                  >
                    Próxima simulação
                    <ArrowRight size={17} />
                  </Link>
                )}

                {!result.correct && (
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold"
                  >
                    Tentar novamente
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
