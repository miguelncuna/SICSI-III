import { useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  MessageCircle,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SocialEngineeringShell from "./SocialEngineeringShell";
import {
  completeSimulation,
  ensureSession,
  getParticipantLabel,
  recordDecision,
} from "./socialEngineeringSession";

export default function SoVagasPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);

  ensureSession();

  const participant = getParticipantLabel();

  const decision = (type) => {
    if (type === "verify") {
      recordDecision(2, {
        action: "Verificou a empresa antes de enviar documentação.",
        score: 3,
        risk: 0,
        technique: "Autoridade + oportunidade",
        consequence: "A candidatura permaneceu sob controlo do candidato.",
      });

      setResult({
        safe: true,
        title: "Candidatura protegida",
        description:
          "Você decidiu verificar a empresa e o processo antes de fornecer documentos pessoais.",
      });
    } else {
      recordDecision(2, {
        action: "Enviou documento pessoal antes da verificação.",
        score: -2,
        risk: 5,
        sharedInformation: "Documento pessoal",
        technique: "Autoridade + oportunidade",
        consequence:
          "Um interlocutor não verificado recebeu informação que poderia ser utilizada para uma nova abordagem.",
      });

      setResult({
        safe: false,
        title: "Você avançou sem verificar",
        description:
          "A promessa de uma oportunidade profissional foi utilizada para acelerar a partilha de informação.",
      });
    }
  };

  const next = () => {
    if (result) {
      completeSimulation(2);
      navigate("/student/simulacoes/engenharia-social/03");
      return;
    }

    setStep((value) => Math.min(value + 1, 1));
  };

  return (
    <SocialEngineeringShell
      simulationNumber={2}
      title="A oportunidade profissional"
      subtitle={`${participant}, uma vaga atractiva chega até si através de um contacto que quer acelerar a sua candidatura.`}
      onBack={() =>
        navigate("/student/simulacoes/engenharia-social/01")
      }
      onNext={next}
      nextLabel={result ? "Próxima simulação" : "Continuar"}
      nextDisabled={step === 1 && !result}
    >
      {step === 0 ? (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <BriefcaseBusiness size={24} />
              </div>

              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Só Vagas
                </div>
                <div className="font-black text-slate-950">
                  Nova oportunidade profissional
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-3xl border border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <UserRound size={19} className="text-blue-600" />

                <div>
                  <div className="text-sm font-black text-slate-950">
                    Recrutador
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Contacto recente
                  </div>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-600">
                "Parabéns. O seu perfil foi seleccionado para uma oportunidade
                especial. Precisamos apenas de confirmar alguns dados para
                concluir a candidatura hoje."
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="min-h-[46px] rounded-2xl bg-[#2454E8] px-4 text-sm font-black text-white"
                >
                  Ver vaga
                </button>

                <button
                  type="button"
                  onClick={() => {
                    recordDecision(2, {
                      action: "Pediu mais informação sobre a vaga.",
                      score: 1,
                      risk: 0,
                    });
                    setStep(1);
                  }}
                  className="min-h-[46px] rounded-2xl border border-slate-200 px-4 text-sm font-black text-slate-700"
                >
                  Ver empresa
                </button>
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-orange-100 bg-orange-50 p-6">
            <ShieldAlert className="text-orange-600" />

            <h2 className="mt-4 font-black text-slate-950">
              O detalhe importante
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              A oportunidade parece vantajosa, mas o contacto quer reduzir o
              tempo disponível para verificação.
            </p>
          </aside>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-600" />
              <h2 className="font-black text-slate-950">
                Última etapa da candidatura
              </h2>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              O suposto recrutador pede um documento pessoal para "validar"
              imediatamente a candidatura.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Pedido
              </div>

              <div className="mt-2 text-sm font-bold text-slate-800">
                Envie o documento para podermos concluir a candidatura.
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => decision("verify")}
                className="min-h-[54px] rounded-2xl bg-emerald-50 px-4 text-sm font-black text-emerald-700"
              >
                Verificar empresa primeiro
              </button>

              <button
                type="button"
                onClick={() => decision("send")}
                className="min-h-[54px] rounded-2xl bg-red-50 px-4 text-sm font-black text-red-700"
              >
                Enviar documento
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
                <MessageCircle className="text-red-600" />
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