import { useEffect, useMemo, useState } from "react";
import {
  User,
  Mail,
  Lock,
  Save,
  ShieldCheck,
  Eye,
  EyeOff,
  Info,
  CheckCircle2,
  CircleAlert,
  Settings,
  GraduationCap,
  Activity,
  Lightbulb,
  ChevronRight,
  Sparkles,
  Shield,
  Fingerprint,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user]);

  const nomeCompleto =
    user?.name || name || "Utilizador SICSI";

  const emailActual =
    user?.email || email || "Sem email";

  const iniciais = useMemo(() => {
    const partes = nomeCompleto
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (partes.length === 0) {
      return "SC";
    }

    if (partes.length === 1) {
      return partes[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
  }, [nomeCompleto]);

  const funcao =
    user?.role === "admin"
      ? "Administrador"
      : "Estudante";

  const nivel =
    user?.awareness_level ||
    "Não avaliado";

  const passwordStrength =
    getPasswordStrength(password);

  function showMessage(
    text,
    type = "success"
  ) {
    setMessage(text);
    setMessageType(type);

    window.setTimeout(() => {
      setMessage("");
    }, 4500);
  }

  function saveProfile(event) {
    event.preventDefault();

    const nome = name.trim();
    const novoEmail = email.trim();

    if (!nome) {
      showMessage(
        "Informe o seu nome completo.",
        "error"
      );
      return;
    }

    if (!novoEmail) {
      showMessage(
        "Informe o seu email.",
        "error"
      );
      return;
    }

    setSaving(true);

    const updated = {
      ...user,
      name: nome,
      email: novoEmail,
    };

    updateUser(updated);

    localStorage.setItem(
      "sicsi_user",
      JSON.stringify(updated)
    );

    window.setTimeout(() => {
      setSaving(false);

      showMessage(
        "Dados da conta actualizados nesta sessão.",
        "success"
      );
    }, 450);
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
          <span>Início</span>

          <ChevronRight size={15} />

          <span className="font-semibold text-slate-700">
            Definições
          </span>
        </div>

        {/* Cabeçalho */}
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              <Settings size={14} />
              Conta SICSI III
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Definições
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Consulte e actualize os dados da sua conta
              e mantenha a sua experiência SICSI segura.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={21} />
            </div>

            <div>
              <p className="text-sm font-bold text-emerald-700">
                Conta activa
              </p>

              <p className="text-xs text-slate-500">
                Sessão actual
              </p>
            </div>
          </div>
        </div>

        {/* Perfil */}
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-sky-100/70 p-5 shadow-sm sm:p-7">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />

          <div className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-600 to-blue-800 text-2xl font-black text-white shadow-lg shadow-blue-200 sm:h-28 sm:w-28 sm:text-3xl">
                  {iniciais}
                </div>

                <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-white bg-emerald-500" />
              </div>

              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-black text-slate-900">
                    {nomeCompleto}
                  </h2>

                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                    <CheckCircle2 size={13} />
                    Activa
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail
                    size={16}
                    className="text-blue-600"
                  />

                  <span>{emailActual}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge
                    icon={GraduationCap}
                    label={funcao}
                  />

                  <Badge
                    icon={Activity}
                    label={`Consciência: ${nivel}`}
                  />
                </div>
              </div>
            </div>

            <div className="hidden text-right lg:block">
              <Shield
                size={86}
                strokeWidth={1}
                className="ml-auto text-blue-200"
              />

              <p className="mt-1 text-sm font-bold text-blue-700">
                Mais consciência.
                <br />
                Mais segurança.
              </p>
            </div>
          </div>
        </section>

        {/* Feedback */}
        {message && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${
              messageType === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {messageType === "error" ? (
              <CircleAlert
                size={20}
                className="mt-0.5 shrink-0"
              />
            ) : (
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0"
              />
            )}

            <div>
              <p className="text-sm font-bold">
                {messageType === "error"
                  ? "Verifique os dados"
                  : "Operação concluída"}
              </p>

              <p className="mt-0.5 text-sm opacity-90">
                {message}
              </p>
            </div>
          </div>
        )}

        {/* Área principal */}
        <div className="grid gap-6 lg:grid-cols-[1fr_310px]">

          {/* DADOS PESSOAIS */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-7">
            <SectionHeader
              icon={User}
              title="Dados pessoais"
              description="Actualize os dados principais e a palavra-passe da sua conta."
            />

            <form
              onSubmit={saveProfile}
              className="mt-7"
            >
              <div className="grid gap-5 md:grid-cols-2">

                <Field
                  label="Nome completo"
                  icon={User}
                  value={name}
                  onChange={setName}
                  placeholder="Introduza o seu nome completo"
                />

                <Field
                  label="Email"
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="nome@exemplo.com"
                />
              </div>

              {/* Separador */}
              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                  <Lock size={13} />
                  Segurança
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Palavra-passe */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-bold text-slate-700">
                    Nova palavra-passe
                  </label>

                  <span className="text-[11px] font-semibold text-slate-400">
                    Opcional
                  </span>
                </div>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Deixe vazio para não alterar"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Ocultar palavra-passe"
                        : "Mostrar palavra-passe"
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {/* Força */}
                {password && (
                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        Força da palavra-passe
                      </span>

                      <span
                        className={`text-xs font-black ${passwordStrength.textClass}`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {[1, 2, 3, 4, 5].map(
                        (level) => (
                          <div
                            key={level}
                            className={`h-2 rounded-full transition ${
                              level <=
                              passwordStrength.score
                                ? passwordStrength.barClass
                                : "bg-slate-200"
                            }`}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Requisitos */}
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <PasswordRule
                    active={
                      password.length >= 8
                    }
                    text="Pelo menos 8 caracteres"
                  />

                  <PasswordRule
                    active={
                      /[A-Z]/.test(password) &&
                      /[a-z]/.test(password)
                    }
                    text="Maiúsculas e minúsculas"
                  />

                  <PasswordRule
                    active={/\d/.test(password)}
                    text="Pelo menos um número"
                  />

                  <PasswordRule
                    active={
                      /[^A-Za-z0-9]/.test(
                        password
                      )
                    }
                    text="Carácter especial"
                  />
                </div>

                <div className="mt-5 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <Info
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <p className="text-xs leading-5 text-blue-700">
                    A palavra-passe introduzida neste
                    campo é utilizada apenas para a
                    análise local da força e não é
                    guardada no navegador.
                  </p>
                </div>
              </div>

              {/* Guardar */}
              <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck
                    size={16}
                    className="text-emerald-500"
                  />

                  <span>
                    As alterações do perfil são guardadas
                    na sessão actual.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      A guardar...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Guardar alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* CONTA SICSI */}
          <section className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
            <SectionHeader
              icon={Fingerprint}
              title="Conta SICSI"
              description="Resumo do estado actual da sua conta."
            />

            <div className="mt-6 space-y-3">
              <InfoCard
                icon={GraduationCap}
                label="Função"
                value={funcao}
              />

              <InfoCard
                icon={Mail}
                label="Email"
                value={emailActual}
              />

              <InfoCard
                icon={Activity}
                label="Consciência digital"
                value={nivel}
              />

              <InfoCard
                icon={ShieldCheck}
                label="Estado da conta"
                value="Activa"
                success
              />
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-emerald-800">
                    Conta SICSI activa
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    A sua sessão está activa e pronta
                    para continuar a aprendizagem.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Consciência digital */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-200">
                <Activity size={22} />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Nível de consciência digital
                </h2>

                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                  O seu nível representa o estado actual
                  de consciência em segurança da informação
                  registado pelo SICSI.
                </p>
              </div>
            </div>

            <div className="min-w-0 md:w-80">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Nível actual
                  </p>

                  <p className="mt-1 text-2xl font-black text-blue-600">
                    {nivel}
                  </p>
                </div>

                <Sparkles
                  size={24}
                  className="text-blue-500"
                />
              </div>

              <div className="mt-4 grid grid-cols-6 gap-1.5">
                {[1, 2, 3, 4, 5, 6].map(
                  (item) => (
                    <div
                      key={item}
                      className={`h-2.5 rounded-full ${
                        user?.awareness_level &&
                        item <=
                          awarenessVisualLevel(
                            nivel
                          )
                          ? "bg-blue-600"
                          : "bg-slate-200"
                      }`}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Dica SICSI */}
        <section className="relative mt-6 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-sky-50 p-6 shadow-sm sm:p-7">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-100/60 blur-2xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-500 shadow-sm">
              <Lightbulb size={30} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-blue-900">
                  Dica SICSI
                </h2>

                <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700">
                  Segurança
                </span>
              </div>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Nunca partilhe a sua palavra-passe,
                códigos de autenticação ou credenciais
                de acesso com terceiros.
              </p>
            </div>

            <div className="hidden shrink-0 text-right sm:ml-auto sm:block">
              <ShieldCheck
                size={54}
                strokeWidth={1.4}
                className="text-blue-200"
              />

              <p className="mt-1 text-xs font-bold text-blue-600">
                Conhecimento hoje.
                <br />
                Segurança amanhã.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="flex flex-col gap-2 px-2 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-bold text-blue-600">
              SICSI III
            </span>{" "}
            · Plataforma de Consciencialização em
            Segurança da Informação
          </p>

          <p>
            Conta e segurança
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTES                                                                */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-200">
        <Icon size={21} />
      </div>

      <div>
        <h2 className="text-base font-black text-slate-900 sm:text-lg">
          {title}
        </h2>

        <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

function Badge({
  icon: Icon,
  label,
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
      <Icon size={14} />
      {label}
    </span>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        />
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  success = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-100 hover:bg-blue-50/50">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            success
              ? "bg-emerald-50 text-emerald-600"
              : "bg-white text-blue-600"
          }`}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p
            className={`mt-0.5 truncate text-sm font-black ${
              success
                ? "text-emerald-700"
                : "text-slate-800"
            }`}
          >
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function PasswordRule({
  active,
  text,
}) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2
        size={16}
        className={
          active
            ? "text-emerald-500"
            : "text-slate-300"
        }
      />

      <span
        className={`text-xs ${
          active
            ? "font-semibold text-slate-700"
            : "text-slate-400"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FUNÇÕES AUXILIARES                                                         */
/* -------------------------------------------------------------------------- */

function getPasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      label: "Não avaliada",
      textClass: "text-slate-400",
      barClass: "bg-slate-300",
    };
  }

  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }

  if (password.length >= 12) {
    score += 1;
  }

  if (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password)
  ) {
    score += 1;
  }

  if (/\d/.test(password)) {
    score += 1;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  if (score <= 1) {
    return {
      score,
      label: "Muito fraca",
      textClass: "text-red-600",
      barClass: "bg-red-500",
    };
  }

  if (score === 2) {
    return {
      score,
      label: "Fraca",
      textClass: "text-orange-600",
      barClass: "bg-orange-500",
    };
  }

  if (score === 3) {
    return {
      score,
      label: "Média",
      textClass: "text-amber-600",
      barClass: "bg-amber-500",
    };
  }

  if (score === 4) {
    return {
      score,
      label: "Forte",
      textClass: "text-blue-600",
      barClass: "bg-blue-600",
    };
  }

  return {
    score,
    label: "Muito forte",
    textClass: "text-emerald-600",
    barClass: "bg-emerald-500",
  };
}

function awarenessVisualLevel(level) {
  const normalized = String(level || "")
    .toLowerCase();

  if (
    normalized.includes("muito alto") ||
    normalized.includes("avançado")
  ) {
    return 6;
  }

  if (
    normalized.includes("alto") ||
    normalized.includes("forte")
  ) {
    return 5;
  }

  if (
    normalized.includes("intermédio") ||
    normalized.includes("intermediário") ||
    normalized.includes("medio") ||
    normalized.includes("médio")
  ) {
    return 4;
  }

  if (
    normalized.includes("básico") ||
    normalized.includes("basico")
  ) {
    return 2;
  }

  if (normalized.includes("baixo")) {
    return 1;
  }

  return 3;
}
