import {
  Award,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Users,
  UserCog,
  ArrowUpRight,
  LockKeyhole,
  GraduationCap,
} from "lucide-react";

const indicadores = [
  {
    label: "Utilizadores",
    value: "128",
    detail: "Contas registadas",
    icon: Users,
    accent: "blue",
  },
  {
    label: "Cursos",
    value: "12",
    detail: "Formações disponíveis",
    icon: BookOpen,
    accent: "indigo",
  },
  {
    label: "Certificados",
    value: "67",
    detail: "Certificações emitidas",
    icon: Award,
    accent: "emerald",
  },
  {
    label: "Administradores",
    value: "03",
    detail: "Acesso administrativo",
    icon: UserCog,
    accent: "violet",
  },
];

const accentStyles = {
  blue: {
    icon: "bg-blue-50 text-blue-600",
    glow: "from-blue-500/20 to-cyan-400/5",
    line: "bg-blue-600",
  },
  indigo: {
    icon: "bg-indigo-50 text-indigo-600",
    glow: "from-indigo-500/20 to-blue-400/5",
    line: "bg-indigo-600",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    glow: "from-emerald-500/20 to-cyan-400/5",
    line: "bg-emerald-600",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600",
    glow: "from-violet-500/20 to-blue-400/5",
    line: "bg-violet-600",
  },
};

export default function AdminDashboardPage() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1500px]">
        {/* =========================================================
            HERO PRINCIPAL
        ========================================================= */}
        <section className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-[#071a33] via-[#0b2c57] to-[#1261c9] px-5 py-7 text-white shadow-[0_24px_70px_rgba(15,73,145,0.18)] sm:px-7 sm:py-9 lg:px-10 lg:py-10">
          {/* elementos decorativos */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute bottom-[-120px] left-[42%] h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute right-[18%] top-[18%] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
          <div className="pointer-events-none absolute right-[10%] top-[38%] h-1.5 w-1.5 rounded-full bg-white/60" />

          <div className="relative z-10 grid items-center gap-9 lg:grid-cols-[1.2fr_.8fr]">
            {/* texto */}
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100 backdrop-blur-sm sm:text-[11px]">
                <Sparkles size={13} />
                Administração SICSI III
              </div>

              <h1 className="mt-5 text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
                Painel Administrativo.
                <br />
                <span className="text-blue-200">
                  Mais consciência. Mais segurança.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100/85 sm:text-base">
                Gerir a plataforma, acompanhar o crescimento da comunidade
                e manter uma experiência de aprendizagem digital mais segura,
                organizada e consciente.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white backdrop-blur-sm">
                  <ShieldCheck size={16} className="text-cyan-300" />
                  Plataforma protegida
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white backdrop-blur-sm">
                  <LockKeyhole size={16} className="text-emerald-300" />
                  Ambiente administrativo
                </div>
              </div>
            </div>

            {/* visual */}
            <div className="relative hidden min-h-[250px] items-center justify-center lg:flex">
              <div className="absolute h-64 w-64 rounded-full border border-white/10" />
              <div className="absolute h-48 w-48 rounded-full border border-white/10" />
              <div className="absolute h-32 w-32 rounded-full bg-white/5 blur-xl" />

              <div className="relative flex h-36 w-36 items-center justify-center rounded-[32px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-md">
                <div className="flex h-24 w-24 items-center justify-center rounded-[26px] bg-white text-blue-700 shadow-xl">
                  <ShieldCheck size={54} strokeWidth={1.6} />
                </div>
              </div>

              <div className="absolute left-[7%] top-[17%] rounded-2xl border border-white/10 bg-white/10 px-3.5 py-3 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <GraduationCap size={17} className="text-blue-200" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">
                      Formação
                    </p>
                    <p className="text-sm font-bold">SICSI III</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-[13%] right-[3%] rounded-2xl border border-white/10 bg-white/10 px-3.5 py-3 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={17} className="text-emerald-300" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">
                      Estado
                    </p>
                    <p className="text-sm font-bold">Operacional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            INDICADORES ESTÁTICOS
        ========================================================= */}
        <section className="mt-6 sm:mt-7">
          <div className="mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600 sm:text-[11px]">
              Visão geral
            </span>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Estado actual da plataforma
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Indicadores principais do ambiente administrativo.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {indicadores.map((item) => {
              const Icon = item.icon;
              const style = accentStyles[item.accent];

              return (
                <article
                  key={item.label}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)] sm:p-6"
                >
                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${style.glow} opacity-70`}
                  />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.icon}`}>
                      <Icon size={21} strokeWidth={1.9} />
                    </div>

                    <div className="flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Activo
                    </div>
                  </div>

                  <div className="relative mt-6">
                    <p className="text-sm font-semibold text-slate-500">
                      {item.label}
                    </p>

                    <div className="mt-1 flex items-end gap-2">
                      <span className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                        {item.value}
                      </span>

                      <ArrowUpRight
                        size={17}
                        className="mb-1 text-emerald-500"
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      {item.detail}
                    </p>
                  </div>

                  <div className="relative mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full w-[72%] rounded-full ${style.line} transition-all duration-500 group-hover:w-[88%]`}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* =========================================================
            FRASE FINAL / IDENTIDADE
        ========================================================= */}
        <section className="mt-6 pb-2 sm:mt-7">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ShieldCheck size={19} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Segurança começa com consciência.
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  SICSI III · Sistema de Consciencialização em Segurança da Informação
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Painel Administrativo
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Ambiente de gestão
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
