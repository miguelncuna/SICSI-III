import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  LockKeyhole,
  MessageCircle,
  Laptop,
  ShieldAlert,
  CreditCard,
  KeyRound,
} from "lucide-react";

const AREAS = [
  {
    title: "Phishing, Engenharia Social, Software Pirateado...",
    description:
      "Navegue por situações digitais inspiradas em ambientes reais e tome decisões ao longo de uma jornada completa.",
    tags: ["Email", "Links", "Remetente"],
    status: "Disponível",
    statusType: "active",
    icon: ShieldAlert,
    image:
      "https://images.pexels.com/photos/9218657/pexels-photo-9218657.jpeg?cs=srgb&dl=pexels-pnw-prod-9218657.jpg&fm=jpg",
    imagePosition: "center",
    actionLabel: "Explorar simulação",
    href: "/student/simulacoes/phishing/01",
  },
];

function SimulationCard({ area }) {
  const Icon = area.icon;

  return (
    <div className="group relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.08)] transition-all duration-300 hover:shadow-[0_20px_55px_rgba(15,23,42,0.13)]">
      <div className="grid min-h-[430px] lg:min-h-0 lg:h-[330px] lg:grid-cols-[1.08fr_0.92fr]">

        {/* CONTEÚDO AZUL */}
        <div className="relative flex min-w-0 flex-col overflow-hidden bg-gradient-to-br from-[#2859F5] via-[#2454E8] to-[#2148CE] px-7 py-7 sm:px-9 sm:py-8 lg:px-10 lg:py-8">

          {/* formas decorativas */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-black/[0.07]" />

          {/* topo */}
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2454E8] shadow-sm">
                <span className="text-base font-black">{area.number}</span>
              </div>

              <span
                className={`rounded-full border px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] ${
                  area.statusType === "active"
                    ? "border-emerald-200/30 bg-emerald-400/15 text-emerald-100"
                    : "border-white/20 bg-white/10 text-blue-50"
                }`}
              >
                {area.status}
              </span>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-sm">
              <Icon size={21} strokeWidth={1.8} />
            </div>
          </div>

          {/* título e descrição */}
          <div className="relative z-10 mt-7">
            <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-100/80">
              {area.status}
            </div>

            <h2 className="max-w-[620px] text-[30px] font-black leading-[1.05] tracking-[-0.04em] text-white sm:text-[34px]">
              {area.title}
            </h2>

            <p className="mt-4 max-w-[670px] text-[15px] font-medium leading-6 text-blue-50/90 sm:text-[16px]">
              {area.description}
            </p>
          </div>

          {/* BOTÃO */}
          <div className="relative z-10 mt-6">
            {area.href ? (
              <Link
                to={area.href}
                className="inline-flex min-h-[46px] items-center gap-3 rounded-2xl bg-white px-5 py-3 text-[14px] font-extrabold text-[#2454E8] shadow-[0_8px_24px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-[0_12px_28px_rgba(15,23,42,0.20)] focus:outline-none focus:ring-2 focus:ring-white/80 focus:ring-offset-2 focus:ring-offset-[#2454E8]"
              >
                <span>{area.actionLabel}</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </Link>
            ) : (
              <div className="inline-flex min-h-[46px] items-center gap-3 rounded-2xl bg-white px-5 py-3 text-[14px] font-extrabold text-[#2454E8] shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
                <LockKeyhole size={17} strokeWidth={2} />
                <span>{area.actionLabel}</span>
              </div>
            )}
          </div>

          {/* TAGS — MANTIDOS */}
          <div className="relative z-10 mt-5 flex flex-wrap gap-2">
            {area.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/20 bg-white/[0.09] px-3.5 py-1.5 text-[11px] font-bold text-white/95 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* IMAGEM */}
        <div className="relative min-h-[250px] overflow-hidden bg-slate-100 lg:min-h-0">
          <img
            src={area.image}
            alt={`${area.title} — experiência de cibersegurança`}
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025] ${
              area.imagePosition === "top"
                ? "object-top"
                : area.imagePosition === "bottom"
                  ? "object-bottom"
                  : "object-center"
            }`}
            loading={area.number === "01" ? "eager" : "lazy"}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 via-transparent to-slate-950/10" />

          {/* selo da imagem */}
          <div className="absolute right-5 top-5 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-white shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2">
              <LockKeyhole size={15} strokeWidth={2} />

              <span className="text-[11px] font-extrabold uppercase tracking-[0.12em]">
                Segurança digital
              </span>
            </div>
          </div>

          {/* legenda inferior */}
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-white shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-blue-200">
                  {area.statusType === "active"
                    ? "Experiência interactiva"
                    : "Próxima experiência"}
                </div>

                <div className="mt-1 text-sm font-extrabold">
                  {area.title}
                </div>
              </div>

              {area.statusType === "active" ? (
                <CheckCircle2
                  size={20}
                  className="shrink-0 text-emerald-300"
                  strokeWidth={2}
                />
              ) : (
                <ChevronRight
                  size={20}
                  className="shrink-0 text-blue-200"
                  strokeWidth={2}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SimulationsPage() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-5 sm:px-6 lg:px-8">

        {/* CABEÇALHO */}
        <div className="mb-7 max-w-3xl">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue-600">
            <ShieldAlert size={15} strokeWidth={2.2} />
            Experiências práticas
          </div>

          <h1 className="text-[34px] font-black tracking-[-0.04em] text-slate-950 sm:text-[40px]">
            Simulações
          </h1>

          <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-500 sm:text-[16px]">
            Explore situações digitais realistas e interaja com diferentes
            contextos de segurança da informação.
          </p>
        </div>

        {/* CINCO ÁREAS */}
        <div className="space-y-5">
          {AREAS.map((area) => (
            <SimulationCard key={area.number} area={area} />
          ))}
        </div>
      </div>
    </div>
  );
}





