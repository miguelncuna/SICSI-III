import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  LockKeyhole,
  Menu,
  Play,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Target,
  Users,
  X,
} from "lucide-react";

const securityAreas = [
  {
    icon: ShieldAlert,
    title: "Phishing",
    eyebrow: "Mensagens e links",
    description:
      "Aprenda a identificar sinais de fraude em emails, mensagens, pedidos urgentes e links suspeitos.",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=90",
  },
  {
    icon: Users,
    title: "Engenharia Social",
    eyebrow: "Pessoas e manipulação",
    description:
      "Reconheça tentativas de manipulação que exploram confiança, autoridade, medo ou urgência.",
    image:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1400&q=90",
  },
  {
    icon: LockKeyhole,
    title: "Contas e Credenciais",
    eyebrow: "Acesso e identidade",
    description:
      "Desenvolva hábitos mais seguros para palavras-passe, autenticação e protecção das suas contas.",
    image:
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1400&q=90",
  },
  {
    icon: Target,
    title: "Fraudes Digitais",
    eyebrow: "Prevenção e decisão",
    description:
      "Aprenda a analisar propostas, oportunidades e pedidos inesperados antes de tomar uma decisão.",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=90",
  },
];

const journey = [
  {
    number: "01",
    title: "Avalie",
    text: "Comece por compreender o seu nível actual de consciência digital.",
    icon: Target,
  },
  {
    number: "02",
    title: "Aprenda",
    text: "Explore conteúdos estruturados e relacionados com situações do quotidiano.",
    icon: BookOpen,
  },
  {
    number: "03",
    title: "Pratique",
    text: "Tome decisões em simulações e observe as consequências das suas escolhas.",
    icon: Shield,
  },
  {
    number: "04",
    title: "Evolua",
    text: "Acompanhe o seu percurso, consolide conhecimentos e avance com confiança.",
    icon: GraduationCap,
  },
];

const faqs = [
  {
    question: "O SICSI III é dirigido a estudantes?",
    answer:
      "Sim. A plataforma foi concebida para ajudar estudantes a compreender ameaças digitais e desenvolver comportamentos mais seguros.",
  },
  {
    question: "É necessário ter conhecimentos técnicos?",
    answer:
      "Não. O percurso parte de conceitos essenciais e evolui através de aprendizagem progressiva e prática.",
  },
  {
    question: "Como começa o percurso?",
    answer:
      "Depois do registo, o estudante realiza uma autoavaliação inicial que ajuda a identificar o seu nível de consciência digital.",
  },
];

function Brand({ light = false }) {
  return (
    <Link
      to="/"
      className="group flex items-center gap-3"
    >
      <div
        className={[
          "flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition duration-300 group-hover:scale-105",
          light
            ? "bg-white text-blue-700"
            : "bg-blue-600 text-white",
        ].join(" ")}
      >
        <ShieldCheck size={23} strokeWidth={2} />
      </div>

      <div>
        <p
          className={[
            "text-[17px] font-black tracking-tight",
            light ? "text-white" : "text-slate-950",
          ].join(" ")}
        >
          SICSI III
        </p>

        <p
          className={[
            "text-[11px] font-semibold tracking-wide",
            light ? "text-blue-100" : "text-slate-500",
          ].join(" ")}
        >
          Segurança Digital
        </p>
      </div>
    </Link>
  );
}

function PrimaryButton({ to, children, white = false }) {
  return (
    <Link
      to={to}
      className={[
        "group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-black transition duration-300 hover:-translate-y-0.5",
        white
          ? "bg-white text-blue-700 shadow-xl shadow-blue-950/20 hover:bg-blue-50"
          : "bg-blue-600 text-white shadow-lg shadow-blue-700/20 hover:bg-blue-700",
      ].join(" ")}
    >
      {children}
      <ArrowRight
        size={17}
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </Link>
  );
}

function AnchorButton({ href, children, dark = false }) {
  return (
    <a
      href={href}
      className={[
        "group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-black transition duration-300 hover:-translate-y-0.5",
        dark
          ? "border border-white/30 bg-white/10 text-white hover:bg-white/15"
          : "border border-slate-300 bg-white text-slate-800 hover:border-blue-300 hover:text-blue-700",
      ].join(" ")}
    >
      {children}
      <ChevronRight
        size={17}
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </a>
  );
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  function closeMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes sicsiHeroIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sicsiHeroImage {
          from {
            opacity: 0;
            transform: scale(1.045);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes sicsiScan {
          0% {
            transform: translateY(-120%);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateY(120%);
            opacity: 0;
          }
        }

        .sicsi-hero-in {
          animation: sicsiHeroIn 850ms cubic-bezier(.2,.8,.2,1) both;
        }

        .sicsi-hero-image {
          animation: sicsiHeroImage 1100ms cubic-bezier(.2,.8,.2,1) both;
        }

        .sicsi-scan {
          animation: sicsiScan 4s 1.3s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          .sicsi-hero-in,
          .sicsi-hero-image,
          .sicsi-scan {
            animation: none;
          }
        }
      `}</style>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <nav className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-6 lg:px-8">
          <Brand />

          <div className="hidden items-center gap-1 lg:flex">
            <Link
              to="/"
              className="rounded-lg px-4 py-2.5 text-sm font-black text-blue-700"
            >
              Início
            </Link>

            <a
              href="#recursos"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
            >
              Recursos
            </a>

            <a
              href="#como-funciona"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
            >
              Como funciona
            </a>

            <a
              href="#sobre"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
            >
              O SICSI
            </a>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Link
              to="/login"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              Entrar
            </Link>

            <Link
              to="/registo"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Criar conta
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 sm:hidden"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
        </nav>
      </header>

      {/* MOBILE NAVIGATION */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] sm:hidden">
          <button
            type="button"
            onClick={closeMenu}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            aria-label="Fechar menu"
          />

          <div className="absolute right-0 top-0 h-full w-[min(88vw,23rem)] overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <Brand />

              <button
                type="button"
                onClick={closeMenu}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-10 grid gap-2">
              <Link
                to="/"
                onClick={closeMenu}
                className="rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-black text-white"
              >
                Início
              </Link>

              <a
                href="#recursos"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              >
                Recursos
              </a>

              <a
                href="#como-funciona"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              >
                Como funciona
              </a>

              <a
                href="#sobre"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              >
                O SICSI
              </a>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <div className="grid gap-3">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-bold text-slate-700"
                >
                  Entrar
                </Link>

                <Link
                  to="/registo"
                  onClick={closeMenu}
                  className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white"
                >
                  Criar conta
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-slate-950 to-blue-950" />

          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(59,130,246,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.35) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid min-h-[650px] items-center gap-12 py-14 lg:grid-cols-[0.88fr_1.12fr] lg:py-20">
            <div className="sicsi-hero-in max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-300">
                Conhecimento hoje. Um amanhã mais seguro.
              </p>

              <div className="mt-4 h-1 w-20 rounded-full bg-blue-500" />

              <h1 className="mt-7 text-5xl font-black leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[4.9rem]">
                Cibersegurança
                <span className="mt-2 block text-blue-400">
                  ao alcance de todos os estudantes.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                Aprenda a reconhecer ameaças, proteger as suas contas e
                desenvolver comportamentos mais seguros através de conteúdos
                práticos e experiências interactivas.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton to="/registo">
                  Começar agora
                </PrimaryButton>

                <AnchorButton
                  href="#como-funciona"
                  dark
                >
                  <Play size={15} fill="currentColor" />
                  Ver como funciona
                </AnchorButton>
              </div>

              <div className="mt-10 grid gap-6 border-t border-white/10 pt-7 sm:grid-cols-3">
                <div>
                  <div className="flex items-center gap-2 text-blue-300">
                    <BookOpen size={17} />
                    <span className="text-sm font-bold text-white">
                      Aprendizagem
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    prática e progressiva
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-blue-300">
                    <Shield size={17} />
                    <span className="text-sm font-bold text-white">
                      Simulações
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    decisões em cenários digitais
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-blue-300">
                    <GraduationCap size={17} />
                    <span className="text-sm font-bold text-white">
                      Evolução
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    conhecimento acompanhado
                  </p>
                </div>
              </div>
            </div>

            <div className="sicsi-hero-image relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-blue-500/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-blue-400/20 bg-blue-950 shadow-2xl">
                <div className="relative h-[450px] sm:h-[560px]">
                  <img
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=90"
                    alt="Tecnologia e cibersegurança"
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-blue-950/75 via-blue-950/25 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

                  <div className="absolute left-5 top-5 rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold text-white">
                        Ambiente de aprendizagem
                      </span>
                    </div>
                  </div>

                  <div className="absolute right-5 top-5 rounded-2xl border border-blue-300/20 bg-blue-950/80 p-4 backdrop-blur-md">
                    <ShieldCheck
                      size={27}
                      className="text-blue-300"
                    />
                  </div>

                  <div className="sicsi-scan absolute left-0 right-0 top-1/2 h-px bg-blue-400/70 shadow-[0_0_18px_rgba(96,165,250,.8)]" />

                  <div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-xl sm:left-7 sm:right-7">
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-300">
                      Um estudante mais consciente
                    </p>

                    <p className="mt-2 text-xl font-black leading-tight sm:text-2xl">
                      controla melhor as suas decisões digitais.
                    </p>

                    <div className="mt-5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-blue-500" />
                      <div className="h-1.5 w-16 rounded-full bg-white/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INDICADORES */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-0 px-5 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div className="border-b border-slate-200 px-4 py-7 lg:border-b-0 lg:border-r lg:px-7">
            <p className="text-2xl font-black text-slate-950">
              01
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Autoavaliação inicial
            </p>
          </div>

          <div className="border-b border-slate-200 px-4 py-7 lg:border-b-0 lg:border-r lg:px-7">
            <p className="text-2xl font-black text-slate-950">
              03
            </p>
            <p className="mt-1 text-sm text-slate-500">
              aulas no curso actual
            </p>
          </div>

          <div className="border-b border-slate-200 px-4 py-7 md:border-b-0 md:border-r lg:px-7">
            <p className="text-2xl font-black text-slate-950">
              10
            </p>
            <p className="mt-1 text-sm text-slate-500">
              questões no teste final
            </p>
          </div>

          <div className="px-4 py-7 lg:px-7">
            <p className="text-2xl font-black text-blue-600">
              100%
            </p>
            <p className="mt-1 text-sm text-slate-500">
              foco em consciência digital
            </p>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section
        id="recursos"
        className="scroll-mt-24 bg-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-end gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Áreas de segurança
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Conheça os riscos que pode encontrar no mundo digital.
              </h2>
            </div>

            <p className="max-w-2xl text-base leading-7 text-slate-600">
              O SICSI transforma diferentes tipos de risco digital em
              oportunidades de aprendizagem, permitindo compreender os sinais
              antes de tomar uma decisão.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {securityAreas.map(
              ({
                icon: Icon,
                title,
                eyebrow,
                description,
                image,
              }) => (
                <article
                  key={title}
                  className="group relative overflow-hidden rounded-[1.75rem] bg-slate-950"
                >
                  <div className="relative h-[330px]">
                    <img
                      src={image}
                      alt={title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                          <Icon size={20} />
                        </div>

                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-300">
                            {eyebrow}
                          </p>

                          <h3 className="mt-1 text-xl font-black text-white">
                            {title}
                          </h3>
                        </div>
                      </div>

                      <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
                        {description}
                      </p>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section
        id="como-funciona"
        className="scroll-mt-24 bg-slate-50"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Como funciona
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Um percurso pensado para aprender e aplicar.
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              O estudante não precisa saber tudo no início. O percurso começa
              no nível actual e evolui através de conhecimento e prática.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-4">
            {journey.map(
              ({ number, title, text, icon: Icon }) => (
                <div
                  key={number}
                  className="relative border-t-2 border-blue-100 pt-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <Icon size={20} />
                    </div>

                    <span className="text-4xl font-black text-blue-100">
                      {number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-black text-slate-950">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {text}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* SOBRE / MISSÃO */}
      <section
        id="sobre"
        className="scroll-mt-24 bg-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                O propósito
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Segurança começa com consciência.
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                O SICSI III é uma plataforma de conscientização em
                cibersegurança criada para ajudar estudantes a compreender
                ameaças digitais e desenvolver comportamentos mais seguros.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex gap-4">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <p className="font-black text-slate-950">
                      Aprender
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Conhecimentos essenciais apresentados de forma
                      progressiva.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <p className="font-black text-slate-950">
                      Praticar
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Situações interactivas para transformar conhecimento em
                      decisão.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <p className="font-black text-slate-950">
                      Evoluir
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Acompanhar a aprendizagem e reforçar comportamentos
                      seguros.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-9">
                <PrimaryButton to="/registo">
                  Começar o percurso
                </PrimaryButton>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-blue-100/70 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] bg-blue-950">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1500&q=90"
                  alt="Estudantes em aprendizagem"
                  className="h-[460px] w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-transparent to-blue-950/10" />

                <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-slate-950/75 p-5 backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-300">
                    Para estudantes
                  </p>

                  <p className="mt-2 text-xl font-black text-white">
                    Conhecimento. Consciência. Acção.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIÊNCIA */}
      <section className="bg-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                Mais do que teoria
              </p>

              <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
                Aprenda a tomar decisões melhores quando a situação acontece.
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100">
                As simulações do SICSI foram concebidas para aproximar a
                aprendizagem das decisões que podem surgir numa situação
                digital real.
              </p>
            </div>

            <AnchorButton
              href="#recursos"
              dark
            >
              Conhecer os recursos
            </AnchorButton>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Perguntas frequentes
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Antes de começar
            </h2>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200">
            {faqs.map((item, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={item.question}
                  className="border-b border-slate-200 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"
                  >
                    <span className="text-sm font-black text-slate-950 sm:text-base">
                      {item.question}
                    </span>

                    <ChevronDown
                      size={19}
                      className={[
                        "shrink-0 text-blue-600 transition-transform duration-300",
                        isOpen ? "rotate-180" : "",
                      ].join(" ")}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6">
                      <p className="text-sm leading-6 text-slate-600">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-slate-950 to-blue-950" />

        <div className="relative mx-auto max-w-5xl px-5 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600">
            <ShieldCheck size={28} />
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-blue-300">
            O próximo passo
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            O conhecimento de hoje
            <span className="block text-blue-400">
              protege o seu amanhã.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Crie a sua conta e comece o seu percurso de aprendizagem em
            cibersegurança.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryButton to="/registo">
              Criar conta gratuita
            </PrimaryButton>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Já tenho uma conta
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
            <div>
              <Brand />

              <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
                Plataforma de conscientização em cibersegurança criada para
                ajudar estudantes a compreender ameaças digitais e desenvolver
                comportamentos mais seguros.
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Explorar
              </p>

              <div className="mt-4 grid gap-3 text-sm">
                <a
                  href="#recursos"
                  className="text-slate-600 transition hover:text-blue-700"
                >
                  Recursos
                </a>

                <a
                  href="#como-funciona"
                  className="text-slate-600 transition hover:text-blue-700"
                >
                  Como funciona
                </a>

                <a
                  href="#sobre"
                  className="text-slate-600 transition hover:text-blue-700"
                >
                  O SICSI
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Aceder
              </p>

              <div className="mt-4 grid gap-3 text-sm">
                <Link
                  to="/login"
                  className="text-slate-600 transition hover:text-blue-700"
                >
                  Entrar
                </Link>

                <Link
                  to="/registo"
                  className="text-slate-600 transition hover:text-blue-700"
                >
                  Criar conta
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>SICSI III · Segurança Digital</p>
            <p>Conhecimento · Consciência · Acção</p>
          </div>
        </div>
      </footer>
    </main>
  );
}