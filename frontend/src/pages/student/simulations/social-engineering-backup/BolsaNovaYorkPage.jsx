import { useState } from "react";
import {
  CheckCircle2,
  GraduationCap,
  Mail,
  ShieldAlert,
  WalletCards,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SocialEngineeringShell from "./SocialEngineeringShell";
import {
  completeSimulation,
  finishSession,
  getParticipantLabel,
  recordDecision,
} from "./socialEngineeringSession";

export default function BolsaNovaYorkPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);

  const participant = getParticipantLabel();

  const decide = (safe) => {
    if (safe) {
      recordDecision(5, {
        action: "Verificou o programa e o contacto antes de enviar documentos ou efectuar pagamento.",
        score: 4,
        risk: 0,
        technique: "Prestígio + oportunidade + urgência",
        consequence:
          "A candidatura permaneceu protegida enquanto os elementos oficiais não fossem confirmados.",
      });

      setResult({
        safe: true,
        title: "Você protegeu a candidatura",
        description:
          "A importância da oportunidade não anulou a necessidade de verificar o processo.",
      });
    } else {
      recordDecision(5, {
        action: "Aceitou pagar uma taxa solicitada por um contacto não verificado.",
        score: -4,
        risk: 7,
        sharedInformation: "Dados de candidatura",
        authorisation: "Pagamento de taxa",
        technique: "Prestígio + oportunidade + urgência",
        consequence:
          "A promessa de uma oportunidade internacional foi usada para justificar uma solicitação financeira.",
      });

      setResult({
        safe: false,
        title: "A oportunidade foi usada como pressão",
        description:
          "A expectativa de conseguir uma bolsa reduziu a atenção dada à verificação do processo.",
      });
    }
  };

  const next = () => {
    if (result) {
      completeSimulation(5);
      finishSession();
      navigate("/student/simulacoes/engenharia-social/final");
      return;
    }

    setStep((value) => Math.min(value + 1, 1));
  };

  return (
    <SocialEngineeringShell
      simulationNumber={5}
      title="A bolsa que parecia demasiado importante para perder"
      subtitle={`${participant}, uma candidatura internacional chega à fase final quando aparece uma exigência inesperada.`}
      onBack={() =>
        navigate("/student/simulacoes/engenharia-social/04")
      }
      onNext={next}
      nextLabel={result ? "Encerrar simulação" : "Continuar"}
      nextDisabled={step === 1 && !result}
    >
      {step === 0 ? (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <GraduationCap size={25} />
              </div>

              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Bolsa para Nova York
                </div>

                <div className="font-black text-slate-950">
                  Estado da candidatura
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-3xl border border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <Mail className="text-blue-600" size={19} />

                <div>
                  <div className="text-sm font-black text-slate-950">
                    Actualização recebida
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Coordenação da candidatura
                  </div>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-600">
                A sua candidatura avançou para uma fase final. Antes da
                confirmação, é solicitada uma acção adicional para "garantir"
                a vaga.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="min-h-[46px] rounded-2xl bg-[#2454E8] px-4 text-sm font-black text-white"
                >
                  Ver programa
                </button>

                <button
                  type="button"
                  onClick={() => {
                    recordDecision(5, {
                      action: "Consultou os requisitos do programa.",
                      score: 1,
                      risk: 0,
                    });
                    setStep(1);
                  }}
                  className="min-h-[46px] rounded-2xl border border-slate-200 px-4 text-sm font-black text-slate-700"
                >
                  Ver requisitos
                </button>
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-indigo-100 bg-indigo-50 p-6">
            <ShieldAlert className="text-indigo-600" />

            <h2 className="mt-4 font-black text-slate-950">
              O valor da oportunidade
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Quanto mais importante parece uma oportunidade, maior pode ser a
              pressão psicológica para não a perder.
            </p>
          </aside>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <WalletCards className="text-blue-600" />

              <h2 className="font-black text-slate-950">
                Última exigência
              </h2>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              Um contacto afirma que uma pequena taxa deve ser paga
              imediatamente para reservar a vaga.
            </p>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                Atenção
              </div>

              <div className="mt-2 text-sm font-black text-amber-900">
                "Se não pagar hoje, a vaga será atribuída a outro candidato."
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => decide(true)}
                className="min-h-[54px] rounded-2xl bg-emerald-50 px-4 text-sm font-black text-emerald-700"
              >
                Verificar o processo
              </button>

              <button
                type="button"
                onClick={() => decide(false)}
                className="min-h-[54px] rounded-2xl bg-red-50 px-4 text-sm font-black text-red-700"
              >
                Pagar taxa
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