import { useEffect, useState } from "react";
import {
  Award,
  ArrowUpRight,
  BookOpen,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";

const API = "http://127.0.0.1:8000/api";

async function getStats() {
  const response = await fetch(`${API}/admin/stats`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        "Não foi possível carregar os indicadores da plataforma."
    );
  }

  return data;
}

const cardConfig = [
  {
    key: "users",
    label: "Utilizadores",
    description: "Contas registadas",
    icon: Users,
    iconBox: "bg-blue-50 text-blue-600",
    accent: "bg-blue-600",
  },
  {
    key: "courses",
    label: "Cursos",
    description: "Formações disponíveis",
    icon: BookOpen,
    iconBox: "bg-indigo-50 text-indigo-600",
    accent: "bg-indigo-600",
  },
  {
    key: "certificates",
    label: "Certificados",
    description: "Certificações emitidas",
    icon: Award,
    iconBox: "bg-emerald-50 text-emerald-600",
    accent: "bg-emerald-600",
  },
  {
    key: "admins",
    label: "Administradores",
    description: "Contas com acesso administrativo",
    icon: UserCog,
    iconBox: "bg-violet-50 text-violet-600",
    accent: "bg-violet-600",
  },
];

function formatNumber(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("pt-PT").format(number);
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        setLoading(true);
        setError("");

        const data = await getStats();

        if (active) {
          setStats(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              "Não foi possível carregar os dados do Dashboard."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1480px]">
        {/* =========================================================
            CARD PRINCIPAL
        ========================================================= */}
        <section className="relative mb-8 overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-[#071a33] via-[#0d315f] to-[#1762c7] px-5 py-7 text-white shadow-[0_22px_60px_rgba(15,73,145,0.16)] sm:px-7 sm:py-8 lg:px-10 lg:py-9">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute bottom-[-130px] left-[48%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.25fr_.75fr]">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100 backdrop-blur-sm sm:text-[11px]">
                <Sparkles size={13} />
                Administração SICSI III
              </div>

              <h2 className="mt-5 max-w-3xl text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-[46px]">
                Painel Administrativo.
                <br />
                <span className="text-blue-200">
                  Mais consciência. Mais segurança.
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100/90 sm:text-base">
                Gerir a plataforma, acompanhar os seus principais indicadores
                e proporcionar uma experiência de aprendizagem digital mais
                segura, organizada e consciente.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white backdrop-blur-sm">
                  <ShieldCheck size={16} className="text-cyan-300" />
                  Plataforma protegida
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white backdrop-blur-sm">
                  <Users size={16} className="text-blue-200" />
                  Gestão centralizada
                </div>
              </div>
            </div>

            <div className="relative hidden min-h-[240px] items-center justify-center lg:flex">
              <div className="absolute h-60 w-60 rounded-full border border-white/10" />
              <div className="absolute h-44 w-44 rounded-full border border-white/10" />
              <div className="absolute h-32 w-32 rounded-full bg-white/5 blur-xl" />

              <div className="relative flex h-36 w-36 items-center justify-center rounded-[32px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-md">
                <div className="flex h-24 w-24 items-center justify-center rounded-[26px] bg-white text-blue-700 shadow-xl">
                  <ShieldCheck size={54} strokeWidth={1.6} />
                </div>
              </div>

              <div className="absolute left-[5%] top-[12%] rounded-2xl border border-white/10 bg-white/10 px-3.5 py-3 shadow-lg backdrop-blur-md">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">
                  SICSI III
                </p>
                <p className="mt-1 text-sm font-bold">Administração</p>
              </div>

              <div className="absolute bottom-[10%] right-[2%] rounded-2xl border border-white/10 bg-white/10 px-3.5 py-3 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
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
            CABEÇALHO
        ========================================================= */}
        <section className="mb-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 sm:text-[11px]">
                Visão geral
              </span>

              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Estado actual da plataforma
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Indicadores principais do ambiente administrativo do SICSI III.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Dados em tempo real
            </div>
          </div>
        </section>

        {/* =========================================================
            ERRO
        ========================================================= */}
        {error && (
          <section className="mb-7 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 sm:px-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                <ShieldCheck size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-red-800">
                  Não foi possível carregar os dados.
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            CARTÕES REAIS
        ========================================================= */}
        <section>
          <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-4">
            {cardConfig.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.key}
                  className="group relative flex min-h-[230px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
                >
                  {/* faixa superior */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    {/* topo do cartão */}
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.iconBox}`}
                      >
                        <Icon size={22} strokeWidth={1.9} />
                      </div>

                      <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Activo
                      </div>
                    </div>

                    {/* conteúdo principal */}
                    <div className="mt-7 min-w-0">
                      <p className="text-sm font-semibold text-slate-500">
                        {item.label}
                      </p>

                      {loading ? (
                        <div className="mt-3 flex h-11 items-center">
                          <LoaderCircle
                            size={26}
                            className="animate-spin text-blue-600"
                          />
                        </div>
                      ) : (
                        <div className="mt-2 flex items-end gap-2">
                          <span className="text-4xl font-black leading-none tracking-tight text-slate-950 sm:text-[42px]">
                            {formatNumber(stats?.[item.key])}
                          </span>

                          <ArrowUpRight
                            size={18}
                            className="mb-1 text-emerald-500"
                          />
                        </div>
                      )}

                      <p className="mt-3 max-w-[240px] text-xs leading-5 text-slate-400">
                        {item.description}
                      </p>
                    </div>

                    {/* rodapé */}
                    <div className="mt-auto pt-7">
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                          SICSI III
                        </span>

                        <span
                          className={`h-1.5 w-12 rounded-full ${item.accent} opacity-80 transition-all duration-300 group-hover:w-16`}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* =========================================================
            RODAPÉ DO BLOCO
        ========================================================= */}
        <section className="mt-7">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck size={20} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    Segurança começa com consciência.
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    SICSI III · Sistema de Consciencialização em Segurança da Informação
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-400">
                <Sparkles size={15} className="text-blue-500" />
                Dados ligados à plataforma
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

