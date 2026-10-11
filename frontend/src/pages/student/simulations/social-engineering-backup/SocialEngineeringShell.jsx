import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function SocialEngineeringShell({
  simulationNumber,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextLabel = "Continuar",
  nextDisabled = false,
  status = "Em curso",
}) {
  const progress = Math.round((simulationNumber / 5) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.07)]">
          <div className="bg-gradient-to-br from-[#2859F5] via-[#2454E8] to-[#2148CE] px-5 py-5 text-white sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                  <ShieldCheck size={25} />
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">
                    SICSI III · Engenharia Social
                  </div>

                  <div className="mt-1 text-lg font-black tracking-tight">
                    Simulação {String(simulationNumber).padStart(2, "0")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-sm">
                  <UserRound size={15} />
                  <span>Sr.</span>
                </div>

                <div className="rounded-full border border-emerald-200/20 bg-emerald-400/15 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-emerald-100">
                  {status}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-blue-100">
                <span>Progresso da jornada</span>
                <span>{progress}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-3 flex justify-between text-[10px] font-black uppercase tracking-wider text-blue-100/80">
                {[1, 2, 3, 4, 5].map((item) => (
                  <span
                    key={item}
                    className={item <= simulationNumber ? "text-white" : ""}
                  >
                    {String(item).padStart(2, "0")}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-b border-slate-100 px-5 py-6 sm:px-7">
            <div className="max-w-4xl">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">
                Experiência interactiva
              </div>

              <h1 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </header>

        <main className="py-6">{children}</main>

        <footer className="sticky bottom-0 z-30 mt-6 rounded-[24px] border border-slate-200 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(15,23,42,0.07)] backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
              Voltar
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={nextDisabled}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-[#2454E8] px-6 text-sm font-extrabold text-white shadow-[0_10px_25px_rgba(36,84,232,0.22)] transition hover:-translate-y-0.5 hover:bg-[#2148CE] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {nextLabel}
              {nextLabel.includes("Encerrar") ? (
                <CheckCircle2 size={17} />
              ) : (
                <ArrowRight size={17} />
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}