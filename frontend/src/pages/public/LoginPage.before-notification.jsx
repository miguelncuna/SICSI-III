import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { authService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login(form);

      login(data.user);

      navigate(data.user.role === "admin" ? "/admin" : "/student");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const benefits = [
    {
      title: "Continue o seu percurso de aprendizagem",
      description: "Aceda aos seus conteúdos e retome de onde parou.",
    },
    {
      title: "Acompanhe o seu progresso",
      description: "Veja a sua evolução e conquiste novos objectivos.",
    },
    {
      title: "Pratique em situações reais",
      description: "Tome decisões e desenvolva hábitos digitais mais seguros.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* =========================================================
          50% PAINEL VISUAL + 50% PAINEL DE LOGIN
      ========================================================== */}
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* =========================================================
            PAINEL INSTITUCIONAL
        ========================================================== */}
        <section className="relative hidden min-h-screen overflow-hidden bg-[#06255f] lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=85')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-br from-[#031b49]/95 via-[#062b70]/92 to-[#0b4ea2]/78" />

          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(147,197,253,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(147,197,253,0.35) 1px, transparent 1px)",
                backgroundSize: "46px 46px",
              }}
            />
          </div>

          <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-blue-400/15 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative z-10 flex min-h-screen flex-col px-8 py-8 xl:px-12 xl:py-10">
            {/* LOGO */}
            <Link to="/" className="flex w-fit items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-xl shadow-black/20">
                <ShieldCheck size={34} strokeWidth={2.2} />
              </div>

              <div>
                <div className="text-2xl font-black tracking-tight text-white">
                  SICSI III
                </div>

                <div className="mt-0.5 text-sm font-medium tracking-wide text-blue-100">
                  Segurança Digital
                </div>
              </div>
            </Link>

            <div className="mt-3 h-1 w-20 rounded-full bg-blue-300" />

            {/* CONTEÚDO */}
            <div className="my-auto max-w-2xl py-14">
              <p className="mb-6 text-sm font-bold uppercase tracking-[0.28em] text-blue-300">
                Segurança começa com consciência.
              </p>

              <h1 className="max-w-2xl text-5xl font-black leading-[0.98] tracking-[-0.035em] text-white xl:text-[68px]">
                Continue a construir
                <span className="block text-blue-300">
                  a sua segurança digital.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-blue-50/85 xl:text-lg">
                Entre na sua conta para continuar o seu percurso de
                aprendizagem, rever conhecimentos e praticar decisões perante
                situações digitais.
              </p>

              <div className="mt-9 space-y-5">
                {benefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="flex items-start gap-4"
                  >
                    <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-300/20 bg-white/10 text-blue-200 backdrop-blur-sm">
                      <CheckCircle2 size={21} strokeWidth={2} />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-white xl:text-lg">
                        {benefit.title}
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-blue-100/75 xl:text-[15px]">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RODAPÉ */}
            <div className="flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-300">
                  Conhecimento · Consciência · Acção
                </p>
              </div>

              <div className="max-w-xs border-l border-blue-300/40 pl-4 text-sm leading-6 text-blue-100/75">
                Estudantes mais conscientes constroem um futuro digital mais
                seguro.
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            PAINEL DE LOGIN
        ========================================================== */}
        <section className="relative flex min-h-screen items-center justify-center bg-white px-5 py-8 text-slate-900 sm:px-8 lg:px-10 xl:px-14">
          <div className="absolute left-5 top-6 sm:left-8 lg:left-10 xl:left-14">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
            >
              <ArrowLeft
                size={17}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              Voltar à página inicial
            </Link>
          </div>

          <div className="w-full max-w-md">
            {/* MARCA PARA MOBILE */}
            <div className="mb-9 lg:hidden">
              <Link to="/" className="flex w-fit items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  <ShieldCheck size={26} />
                </div>

                <div>
                  <div className="text-lg font-black tracking-tight">
                    SICSI III
                  </div>

                  <div className="text-xs font-medium text-slate-500">
                    Segurança Digital
                  </div>
                </div>
              </Link>
            </div>

            {/* CABEÇALHO */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                <LockKeyhole size={14} />
                Acesso seguro
              </div>

              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Bem-vindo de volta
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500 sm:text-base">
                Entre na sua conta para continuar a sua jornada de
                aprendizagem no SICSI III.
              </p>
            </div>

            {/* ERRO */}
            {error && (
              <div
                role="alert"
                className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            {/* FORMULÁRIO */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2.5 block text-sm font-semibold text-slate-800"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      email: event.target.value,
                    })
                  }
                  placeholder="seu@email.com"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2.5 block text-sm font-semibold text-slate-800"
                >
                  Palavra-passe
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        password: event.target.value,
                      })
                    }
                    placeholder="Introduza a sua palavra-passe"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-14 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Ocultar palavra-passe"
                        : "Mostrar palavra-passe"
                    }
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    A entrar...
                  </>
                ) : (
                  <>
                    Entrar na minha conta
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* SEGURANÇA */}
            <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Acesso protegido
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Os seus dados de acesso são tratados através do sistema de
                    autenticação do SICSI III.
                  </p>
                </div>
              </div>
            </div>

            {/* REGISTO */}
            <p className="mt-8 text-center text-sm text-slate-500">
              Ainda não tem conta?{" "}
              <Link
                to="/registo"
                className="font-bold text-blue-600 transition hover:text-blue-700"
              >
                Criar conta
              </Link>
            </p>

            <p className="mt-6 text-center text-xs text-slate-400">
              SICSI III · Segurança Digital
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}