import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import { simulationService } from "../../services/api";

const PHISHING_SEQUENCE = [
  "phishing-01",
  "phishing-02",
  "phishing-03",
  "phishing-04",
  "phishing-05",
];

function scoreLabel(score) {
  if (score >= 80) {
    return "Comportamento seguro";
  }

  if (score >= 60) {
    return "Atenção necessária";
  }

  return "Exposição elevada ao risco";
}

export default function PhishingFinalReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("sicsi_user") || "null"
  );

  useEffect(() => {
    let active = true;

    async function loadReport() {
      setLoading(true);
      setError("");

      try {
        const data =
          await simulationService.getPhishingResult(
            user?.id
          );

        if (active) {
          setReport(data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError?.message ||
              "Não foi possível carregar o relatório final."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (user?.id) {
      loadReport();
    } else {
      setError(
        "Utilizador não identificado."
      );
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [user?.id]);

  async function downloadPdf() {
    if (downloading) {
      return;
    }

    setDownloading(true);
    setError("");

    try {
      const result =
        await simulationService.downloadPhishingResultPdf(
          user?.id
        );

      const url = URL.createObjectURL(
        result.blob
      );

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        result.filename ||
        "relatorio-phishing-sicsi-iii.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Não foi possível descarregar o relatório."
      );
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            A preparar a análise final...
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <TriangleAlert className="mx-auto h-10 w-10 text-amber-500" />

          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Relatório ainda não disponível
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error ||
              "Conclua as cinco experiências de Phishing para consultar esta análise."}
          </p>

          <Link
            to="/student/simulacoes"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar às simulações
          </Link>
        </div>
      </div>
    );
  }

  const overallScore =
    Number(report.overall_score || 0);

  const simulations =
    Array.isArray(report.simulations)
      ? report.simulations
      : [];

  const decisions =
    Array.isArray(report.decision_history)
      ? report.decision_history
      : [];

  const dataShared =
    Array.isArray(report.data_shared)
      ? report.data_shared
      : [];

  const feedback =
    Array.isArray(report.chat_feedback)
      ? report.chat_feedback
      : [];

  const recommendations =
    Array.isArray(report.recommendations)
      ? report.recommendations
      : [];

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 pb-12 pt-5 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/student/simulacoes"
          className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-slate-500 transition hover:bg-white hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar às simulações
        </Link>

        <button
          type="button"
          onClick={downloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Descarregar relatório PDF
        </button>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/20">
        <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-600">
                <ShieldCheck className="h-5 w-5" />

                <p className="text-xs font-black uppercase tracking-[0.18em]">
                  Jornada concluída
                </p>
              </div>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Relatório Final de Phishing
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                A análise abaixo reúne o comportamento observado
                nas cinco experiências, sem revelar a avaliação
                durante a experiência.
              </p>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-white px-6 py-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Avaliação global
              </p>

              <div className="mt-1 flex items-end gap-2">
                <span className="text-4xl font-black text-blue-600">
                  {overallScore}%
                </span>

                <span className="pb-1 text-xs font-bold text-slate-500">
                  {report.classification ||
                    scoreLabel(overallScore)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-b border-slate-200 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Experiências
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              {report.completed_count || 0}/
              {report.total_simulations ||
                PHISHING_SEQUENCE.length}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 p-5">
            <p className="text-[10px] font-black uppercase tracking-wide text-emerald-600">
              Acções seguras
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              {report.safe_actions || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-amber-50 p-5">
            <p className="text-[10px] font-black uppercase tracking-wide text-amber-600">
              Exposições ao risco
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              {report.dangerous_actions || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-5">
            <p className="text-[10px] font-black uppercase tracking-wide text-blue-600">
              Denúncias
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              {report.reported_simulations || 0}/5
            </p>
          </div>
        </div>

        <div className="space-y-8 p-5 sm:p-8">
          <section>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-black text-slate-950">
                Leitura do comportamento
              </h2>
            </div>

            <div className="mt-4 space-y-3">
              {feedback.map(
                (message, index) => (
                  <div
                    key={`${message}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600"
                  >
                    {message}
                  </div>
                )
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">
              As cinco experiências
            </h2>

            <div className="mt-4 grid gap-3 lg:grid-cols-5">
              {simulations.map(
                (item, index) => (
                  <div
                    key={item.id || index}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-600">
                      Phishing{" "}
                      {String(
                        item.sequence ||
                          index + 1
                      ).padStart(2, "0")}
                    </p>

                    <h3 className="mt-2 min-h-[48px] text-sm font-black leading-5 text-slate-900">
                      {item.title ||
                        item.id}
                    </h3>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">
                        {item.difficulty ||
                          "—"}
                      </span>

                      <span className="text-sm font-black text-blue-600">
                        {item.score || 0}%
                      </span>
                    </div>

                    <p className="mt-3 text-[11px] font-semibold text-slate-500">
                      {item.dangerous_count || 0} exposição(ões) ao risco
                    </p>
                  </div>
                )
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">
              Decisões registadas
            </h2>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              {decisions.length === 0 ? (
                <div className="p-5 text-sm text-slate-500">
                  Não foram registadas decisões adicionais.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {decisions.map(
                    (decision, index) => (
                      <div
                        key={`${decision.simulation_id || "simulation"}-${index}`}
                        className="grid gap-2 p-4 sm:grid-cols-[90px_1fr_150px]"
                      >
                        <span className="text-xs font-black text-blue-600">
                          Phishing{" "}
                          {String(
                            decision.sequence ||
                              0
                          ).padStart(2, "0")}
                        </span>

                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {decision.title ||
                              decision.action ||
                              "Acção registada"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {decision.simulation_title ||
                              ""}
                          </p>
                        </div>

                        <span className="text-xs font-bold text-slate-500">
                          {decision.safe
                            ? "Acção segura"
                            : "Exposição ao risco"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">
              Informação potencialmente exposta
            </h2>

            <div className="mt-4 space-y-3">
              {dataShared.length === 0 ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm leading-6 text-emerald-800">
                  Não foi identificada informação sensível
                  partilhada nos registos da jornada.
                </div>
              ) : (
                dataShared.map(
                  (item, index) => (
                    <div
                      key={`${item.field || "field"}-${index}`}
                      className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
                    >
                      <p className="text-xs font-black uppercase tracking-wide text-amber-700">
                        {item.field ||
                          "Informação"}
                      </p>

                      <p className="mt-2 text-sm font-bold text-slate-900">
                        {item.value ||
                          "Informação exposta durante a experiência"}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-amber-800">
                        Conteúdo de palavras-passe nunca é guardado.
                      </p>
                    </div>
                  )
                )
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">
              Recomendações para a próxima experiência real
            </h2>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {recommendations.map(
                (recommendation, index) => (
                  <div
                    key={`${recommendation}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white">
                      {index + 1}
                    </span>

                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {recommendation}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">
              Jornada concluída
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              O relatório foi produzido apenas depois da conclusão
              das cinco experiências. A experiência de treino não
              guarda o conteúdo das palavras-passe introduzidas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}