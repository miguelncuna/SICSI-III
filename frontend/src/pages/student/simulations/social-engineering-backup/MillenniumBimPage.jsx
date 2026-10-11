import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Eye,
  Lock,
  MessageSquare,
  ShieldAlert,
  Smartphone,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SocialEngineeringShell from "./SocialEngineeringShell";
import {
  completeSimulation,
  ensureSession,
  getParticipantLabel,
  recordDecision,
} from "./socialEngineeringSession";

export default function MillenniumBimPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const session = ensureSession();
    setName(session.name || "");
  }, []);

  const label = name ? `Sr. ${name}` : "Sr.";

  const choose = (type) => {
    if (result) return;

    if (type === "verify") {
      recordDecision(1, {
        action: "Verificou a solicitação antes de agir.",
        score: 3,
        risk: 0,
        technique: "Urgência + autoridade",
        consequence: "A tentativa de manipulação foi identificada antes de qualquer autorização.",
      });

      setResult({
        type: "safe",
        title: "Boa decisão",
        text:
          "Você interrompeu a pressão e decidiu verificar a solicitação através de um canal independente.",
      });
    }

    if (type === "confirm") {
      recordDecision(1, {
        action: "Confirmou a solicitação recebida.",
        score: -2,
        risk: 4,
        sharedInformation: "Confirmação de identidade/operação",
        authorisation: "Tentativa de autorização bancária",
        technique: "Urgência + autoridade",
        consequence:
          "O interlocutor ganhou confiança suficiente para tentar avançar para a próxima etapa.",
      });

      setResult({
        type: "risk",
        title: "Você entrou na zona de risco",
        text:
          "A solicitação usou autoridade aparente e pressão temporal para reduzir o seu tempo de reflexão.",
      });
    }
  };

  const advance = () => {
    if (result) {
      completeSimulation(1);
      navigate("/student/simulacoes/engenharia-social/02");
      return;
    }

    setStep((current) => Math.min(current + 1, 2));
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0072CE]/10 text-[#0072CE]">
                <Building2 size={24} />
              </div>

              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Millennium bim
                </div>
                <div className="font-black text-slate-950">
                  Centro de notificações
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <MessageSquare size={19} className="text-blue-600" />

                <div>
                  <div className="text-xs font-black text-slate-950">
                    Nova comunicação
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Há poucos minutos
                  </div>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-600">
                {label}, foi detectada uma actividade que requer confirmação
                imediata. O seu acesso poderá ser temporariamente limitado se
                a validação não for concluída.
              </p>

              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="shrink-0 text-amber-600" size={19} />
                <span className="text-xs font-bold leading-5 text-amber-800">
                  A mensagem cria urgência antes de apresentar todos os
                  detalhes.
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-[#2454E8] px-5 text-sm font-extrabold text-white"
              >
                <Eye size={17} />
                Ver detalhes
              </button>

              <button
                type="button"
                onClick={() => {
                  recordDecision(1, {
                    action: "Abriu a comunicação para inspeção.",
                    score: 1,
                    risk: 0,
                  });
                  setStep(1);
                }}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-slate-200 px-5 text-sm font-extrabold text-slate-700"
              >
                Inspeccionar mensagem
              </button>
            </div>
          </section>

          <aside className="rounded-[28px] border border-blue-100 bg-blue-50 p-6">
            <ShieldAlert className="text-blue-600" size={25} />

            <h2 className="mt-4 font-black text-slate-950">
              Observe antes de decidir
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Nesta experiência, não basta reconhecer uma mensagem. O
              objectivo é observar como pressão e autoridade podem influenciar
              uma decisão.
            </p>

            <div className="mt-6 rounded-2xl bg-white p-4">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Técnica presente
              </div>
              <div className="mt-1 text-sm font-black text-slate-900">
                Urgência + autoridade
              </div>
            </div>
          </aside>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <UserCheck className="text-blue-600" />
              <h2 className="font-black text-slate-950">
                Verificação de identidade
              </h2>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              O contacto afirma representar o banco e solicita uma confirmação
              para "proteger" a sua conta.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 p-4">
              <div className="text-xs font-black text-slate-400">
                Pedido recebido
              </div>

              <div className="mt-2 text-sm font-bold text-slate-800">
                "Confirme a operação agora para evitar o bloqueio temporário."
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => choose("verify")}
                className="min-h-[52px] rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-black text-emerald-700"
              >
                Verificar por canal independente
              </button>

              <button
                type="button"
                onClick={() => choose("confirm")}
                className="min-h-[52px] rounded-2xl border border-red-200 bg-red-50 px-4 text-sm font-black text-red-700"
              >
                Confirmar agora
              </button>
            </div>
          </section>

          <aside className="rounded-[28px] border border-slate-200 bg-white p-6">
            <Lock className="text-slate-700" />

            <h2 className="mt-4 font-black text-slate-950">
              Regra de ouro
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Nunca transforme urgência apresentada por outra pessoa em
              urgência sua.
            </p>
          </aside>
        </div>
      );
    }

    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div
          className={`rounded-3xl p-6 ${
            result?.type === "safe"
              ? "border border-emerald-200 bg-emerald-50"
              : "border border-amber-200 bg-amber-50"
          }`}
        >
          {result?.type === "safe" ? (
            <CheckCircle2 className="text-emerald-600" size={30} />
          ) : (
            <AlertTriangle className="text-amber-600" size={30} />
          )}

          <h2 className="mt-4 text-xl font-black text-slate-950">
            {result?.title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {result?.text}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4">
              <div className="text-[10px] font-black uppercase text-slate-400">
                Técnica
              </div>
              <div className="mt-1 text-sm font-black">
                Urgência
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4">
              <div className="text-[10px] font-black uppercase text-slate-400">
                Principal defesa
              </div>
              <div className="mt-1 text-sm font-black">
                Verificação independente
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4">
              <div className="text-[10px] font-black uppercase text-slate-400">
                Próximo passo
              </div>
              <div className="mt-1 text-sm font-black">
                Simulação 02
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SocialEngineeringShell
      simulationNumber={1}
      title="Uma confirmação que parecia urgente"
      subtitle="Uma situação bancária em que autoridade e pressão temporal são usadas para influenciar uma decisão."
      onBack={() =>
        navigate("/student/simulacoes")
      }
      onNext={advance}
      nextLabel={result ? "Próxima simulação" : "Continuar"}
      nextDisabled={step === 1 && !result}
    >
      {!started && (
        <div className="mb-5 rounded-[28px] border border-blue-100 bg-blue-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                Participante
              </div>
              <div className="mt-1 text-lg font-black text-slate-950">
                {label}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStarted(true)}
              className="min-h-[44px] rounded-2xl bg-[#2454E8] px-5 text-sm font-extrabold text-white"
            >
              Iniciar experiência
            </button>
          </div>
        </div>
      )}

      {started || step > 0 ? renderStep() : null}
    </SocialEngineeringShell>
  );
}