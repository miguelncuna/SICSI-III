import { useState } from "react";
import {
  CarFront,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  ShieldAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SocialEngineeringShell from "./SocialEngineeringShell";
import {
  completeSimulation,
  ensureSession,
  getParticipantLabel,
  recordDecision,
} from "./socialEngineeringSession";

export default function BeForwardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);

  ensureSession();

  const participant = getParticipantLabel();

  const decide = (safe) => {
    if (safe) {
      recordDecision(4, {
        action: "Verificou a referência e documentação antes do pagamento.",
        score: 3,
        risk: 0,
        technique: "Confiança + oportunidade financeira",
        consequence:
          "O pagamento não foi autorizado enquanto existiam elementos por confirmar.",
      });

      setResult({
        safe: true,
        title: "Pagamento protegido",
        description:
          "Você separou a oportunidade comercial da decisão financeira e exigiu verificação.",
      });
    } else {
      recordDecision(4, {
        action: "Autorizou o pagamento com base numa solicitação não verificada.",
        score: -3,
        risk: 6,
        authorisation: "Autorização de pagamento",
        technique: "Confiança + oportunidade financeira",
        consequence:
          "A pressão para concluir a operação rapidamente aumentou o risco financeiro.",
      });

      setResult({
        safe: false,
        title: "A decisão financeira ficou exposta",
        description:
          "Uma alteração aparentemente simples foi utilizada para acelerar uma autorização de pagamento.",
      });
    }
  };

  const next = () => {
    if (result) {
      completeSimulation(4);
      navigate("/student/simulacoes/engenharia-social/05");
      return;
    }

    setStep((value) => Math.min(value + 1, 1));
  };

  return (
    <SocialEngineeringShell
      simulationNumber={4}
      title="O veículo, o agente e o pagamento"
      subtitle={`${participant}, uma operação de compra está quase concluída quando surge uma solicitação inesperada.`}
      onBack={() =>
        navigate("/student/simulacoes/engenharia-social/03")
      }
      onNext={next}
      nextLabel={result ? "Próxima simulação" : "Continuar"}
      nextDisabled={step === 1 && !result}
    >
      {step === 0 ? (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <CarFront size={25} />
              </div>

              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                  BE FORWARD
                </div>
                <div className="font-black text-slate-950">
                  Estado da operação
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-3xl border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black text-slate-400">
                    Operação
                  </div>

                  <div className="mt-1 text-sm font-black text-slate-950">
                    Veículo seleccionado
                  </div>
                </div>

                <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  Em processamento
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="min-h-[46px] rounded-2xl bg-[#2454E8] px-4 text-sm font-black text-white"
                >
                  Ver documentação
                </button>

                <button
                  type="button"
                  onClick={() => {
                    recordDecision(4, {
                      action: "Consultou o estado da operação.",
                      score: 1,
                      risk: 0,
                    });
                    setStep(1);
                  }}
                  className="min-h-[46px] rounded-2xl border border-slate-200 px-4 text-sm font-black text-slate-700"
                >
                  Ver estado
                </button>
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-amber-200 bg-amber-50 p-6">
            <ShieldAlert className="text-amber-600" />

            <h2 className="mt-4 font-black text-slate-950">
              Atenção à alteração
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              O cenário muda quando alguém pede uma decisão financeira fora do
              fluxo que estava a seguir.
            </p>
          </aside>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <FileCheck2 className="text-blue-600" />

              <h2 className="font-black text-slate-950">
                Nova instrução de pagamento
              </h2>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              O suposto agente informa que os dados foram actualizados e pede
              que confirme uma nova referência antes de a operação expirar.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Pedido
              </div>

              <div className="mt-2 text-sm font-black text-slate-800">
                Confirme a nova referência para autorizar o pagamento.
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => decide(true)}
                className="min-h-[54px] rounded-2xl bg-emerald-50 px-4 text-sm font-black text-emerald-700"
              >
                Verificar referência
              </button>

              <button
                type="button"
                onClick={() => decide(false)}
                className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 text-sm font-black text-red-700"
              >
                <CircleDollarSign size={17} />
                Autorizar pagamento
              </button>
            </div>
          </section>

          {result && (
            <aside
              className={`rounded-[28px] p-6 ${
                result.safe
                  ? "border border-emerald-200 bg-emerald-50"
                  : "border border-red-200 bg-red-50"
              }`}
            >
              {result.safe ? (
                <CheckCircle2 className="text-emerald-600" />
              ) : (
                <ShieldAlert className="text-red-600" />
              )}

              <h2 className="mt-4 font-black text-slate-950">
                {result.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {result.description}
              </p>
            </aside>
          )}
        </div>
      )}
    </SocialEngineeringShell>
  );
}