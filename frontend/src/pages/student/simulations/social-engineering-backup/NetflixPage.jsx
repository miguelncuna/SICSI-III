import { useState } from "react";
import {
  CheckCircle2,
  MonitorSmartphone,
  PlayCircle,
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

export default function NetflixPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);

  ensureSession();

  const participant = getParticipantLabel();

  const decide = (safe) => {
    if (safe) {
      recordDecision(3, {
        action: "Inspeccionou a actividade antes de alterar a conta.",
        score: 3,
        risk: 0,
        technique: "Medo + autoridade aparente",
        consequence:
          "A tentativa de obter uma alteração sensível foi interrompida.",
      });

      setResult({
        safe: true,
        title: "Você manteve o controlo da conta",
        description:
          "Em vez de reagir à ameaça apresentada, verificou a actividade directamente.",
      });
    } else {
      recordDecision(3, {
        action: "Autorizou uma alteração solicitada pelo suposto suporte.",
        score: -2,
        risk: 5,
        authorisation: "Alteração de segurança da conta",
        technique: "Medo + autoridade aparente",
        consequence:
          "A confiança no interlocutor abriu caminho para uma alteração sensível.",
      });

      setResult({
        safe: false,
        title: "A pressão funcionou",
        description:
          "A possibilidade de perder o acesso levou-o a aceitar uma solicitação sem verificar suficientemente a origem.",
      });
    }
  };

  const next = () => {
    if (result) {
      completeSimulation(3);
      navigate("/student/simulacoes/engenharia-social/04");
      return;
    }

    setStep((value) => Math.min(value + 1, 1));
  };

  return (
    <SocialEngineeringShell
      simulationNumber={3}
      title="A conta que precisava de atenção"
      subtitle={`${participant}, uma mensagem afirma que existe actividade suspeita na sua conta e apresenta uma solução imediata.`}
      onBack={() =>
        navigate("/student/simulacoes/engenharia-social/02")
      }
      onNext={next}
      nextLabel={result ? "Próxima simulação" : "Continuar"}
      nextDisabled={step === 1 && !result}
    >
      {step === 0 ? (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[#0f1014] shadow-xl">
            <div className="border-b border-white/10 px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <PlayCircle size={25} />

                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-white/50">
                    Netflix
                  </div>
                  <div className="font-black">
                    Centro de conta
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="rounded-3xl bg-white/[0.06] p-5 text-white">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="text-red-400" />

                  <div>
                    <div className="text-sm font-black">
                      Actividade suspeita detectada
                    </div>

                    <div className="text-[11px] text-white/40">
                      Notificação de segurança
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-white/65">
                  Foi detectada uma tentativa de acesso que requer a sua
                  atenção. Um contacto de suporte está disponível para ajudar
                  a proteger a conta.
                </p>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-6 min-h-[46px] rounded-2xl bg-white px-5 text-sm font-black text-slate-900"
                >
                  Ver actividade
                </button>
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-slate-200 bg-white p-6">
            <MonitorSmartphone className="text-blue-600" />

            <h2 className="mt-4 font-black text-slate-950">
              Antes de alterar
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Uma conta pode apresentar actividade legítima que parece
              estranha. A primeira defesa é observar os detalhes.
            </p>
          </aside>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <UserRound className="text-blue-600" />

              <div>
                <h2 className="font-black text-slate-950">
                  Contacto de suporte
                </h2>
                <div className="text-xs text-slate-400">
                  Solicitação recebida
                </div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              O interlocutor afirma conseguir resolver o problema, mas pede
              que autorize uma alteração de segurança imediatamente.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 p-4">
              <div className="text-xs font-black text-slate-400">
                Solicitação
              </div>

              <div className="mt-2 text-sm font-bold text-slate-800">
                Autorizar a alteração para impedir a perda de acesso.
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => decide(true)}
                className="min-h-[54px] rounded-2xl bg-emerald-50 px-4 text-sm font-black text-emerald-700"
              >
                Verificar actividade primeiro
              </button>

              <button
                type="button"
                onClick={() => decide(false)}
                className="min-h-[54px] rounded-2xl bg-red-50 px-4 text-sm font-black text-red-700"
              >
                Autorizar alteração
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