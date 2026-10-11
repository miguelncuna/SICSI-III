import {
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SocialEngineeringShell from "./SocialEngineeringShell";
import {
  clearSession,
  getParticipantLabel,
  getSession,
  getTotals,
} from "./socialEngineeringSession";

export default function SocialEngineeringFinalPage() {
  const navigate = useNavigate();

  const session = getSession();
  const totals = getTotals();
  const participant = getParticipantLabel();

  const riskLevel =
    totals.risk >= 18
      ? "Elevado"
      : totals.risk >= 9
        ? "Moderado"
        : "Baixo";

  const resultTitle =
    totals.risk >= 18
      ? "A pressão influenciou várias decisões."
      : totals.risk >= 9
        ? "Você reconheceu alguns riscos, mas houve momentos de exposição."
        : "Você demonstrou uma postura de verificação consistente.";

  const restart = () => {
    clearSession();
    navigate("/student/simulacoes/engenharia-social/01");
  };

  return (
    <SocialEngineeringShell
      simulationNumber={5}
      title={`Jornada concluída, ${participant}`}
      subtitle="Este é o resultado consolidado das cinco experiências de Engenharia Social."
      onBack={() =>
        navigate("/student/simulacoes")
      }
      onNext={() =>
        navigate("/student/simulacoes")
      }
      nextLabel="Voltar às simulações"
    >
      <div className="space-y-5">
        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600">
                <CheckCircle2 size={17} />
                Simulação encerrada
              </div>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                {resultTitle}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                O objectivo não era acertar todas as respostas. Era perceber
                como diferentes técnicas podem alterar a percepção de risco.
              </p>
            </div>

            <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-[28px] bg-blue-50">
              <div className="text-3xl font-black text-[#2454E8]">
                {totals.completed}/5
              </div>
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                concluídas
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[26px] border border-slate-200 bg-white p-5">
            <Target className="text-blue-600" />
            <div className="mt-5 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Decisões
            </div>
            <div className="mt-1 text-2xl font-black text-slate-950">
              {totals.decisions}
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5">
            <ShieldCheck className="text-emerald-600" />
            <div className="mt-5 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Pontuação
            </div>
            <div className="mt-1 text-2xl font-black text-slate-950">
              {totals.score}
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5">
            <AlertTriangle className="text-amber-600" />
            <div className="mt-5 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Risco acumulado
            </div>
            <div className="mt-1 text-2xl font-black text-slate-950">
              {riskLevel}
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5">
            <ShieldCheck className="text-indigo-600" />
            <div className="mt-5 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Técnicas identificadas
            </div>
            <div className="mt-1 text-2xl font-black text-slate-950">
              {totals.techniques.length}
            </div>
          </div>
        </div>

        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
            O que foi observado
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <div>
              <h3 className="font-black text-slate-950">
                Técnicas utilizadas
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {totals.techniques.length > 0 ? (
                  totals.techniques.map((technique) => (
                    <span
                      key={technique}
                      className="rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                    >
                      {technique}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">
                    Nenhuma técnica registada.
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-black text-slate-950">
                Informações partilhadas
              </h3>

              <ul className="mt-3 space-y-2">
                {totals.sharedInformation.length > 0 ? (
                  totals.sharedInformation.map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
                    >
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-emerald-600">
                    Nenhuma informação sensível registada.
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-black text-slate-950">
                Autorizações
              </h3>

              <ul className="mt-3 space-y-2">
                {totals.authorisations.length > 0 ? (
                  totals.authorisations.map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700"
                    >
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-emerald-600">
                    Nenhuma autorização de risco registada.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2454E8] text-white">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2 className="font-black text-slate-950">
                Regra central da Engenharia Social
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Quando alguém tenta controlar a sua decisão através de
                urgência, autoridade, medo, oportunidade ou confiança,
                interrompa o processo e verifique a informação através de um
                canal independente.
              </p>
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={restart}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RotateCcw size={17} />
          Reiniciar experiência
        </button>
      </div>
    </SocialEngineeringShell>
  );
}