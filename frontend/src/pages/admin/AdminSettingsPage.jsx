import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  Bell,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Monitor,
  RefreshCw,
  Save,
  Settings,
  Shield,
  ShieldCheck,
  User,
  UserRound,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const TEXTOS = {
  admin: "Administrador",
  administracao:
    "Administra\u00e7\u00e3o",
  definicoes:
    "Defini\u00e7\u00f5es",
  perfil:
    "Perfil administrativo",
  conta:
    "Conta administrativa",
  seguranca:
    "Seguran\u00e7a da conta",
  preferencias:
    "Prefer\u00eancias",
  sessao:
    "Sess\u00e3o administrativa",
  actualizacao:
    "actualiza\u00e7\u00e3o",
  informacoes:
    "informa\u00e7\u00f5es",
  proteccao:
    "protec\u00e7\u00e3o",
  activa:
    "activa",
};

function obterIniciais(nome) {
  const partes = String(
    nome || ""
  )
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (partes.length === 0) {
    return "AS";
  }

  if (partes.length === 1) {
    return partes[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    partes[0].charAt(0) +
    partes[partes.length - 1].charAt(0)
  ).toUpperCase();
}

function Campo({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>

      <div className="relative">
        <Icon
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-11 text-sm font-semibold !text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            color: "#0f172a",
            WebkitTextFillColor:
              "#0f172a",
          }}
        />
      </div>
    </label>
  );
}

function Toggle({
  checked,
  onChange,
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        checked
          ? "bg-blue-600"
          : "bg-slate-300"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
          checked
            ? "left-6"
            : "left-1"
        }`}
      />
    </button>
  );
}

function InfoLinha({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-black text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const {
    user,
    updateUser,
    refreshUser,
  } = useAuth();

  const [name, setName] =
    useState(
      user?.name || ""
    );

  const [email, setEmail] =
    useState(
      user?.email || ""
    );

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("success");

  const [
    showTips,
    setShowTips,
  ] = useState(() =>
    localStorage.getItem(
      "sicsi_admin_security_tips"
    ) !== "false"
  );

  const [
    interfaceEnabled,
    setInterfaceEnabled,
  ] = useState(() =>
    localStorage.getItem(
      "sicsi_admin_interface_enabled"
    ) !== "false"
  );

  const [
    notifications,
    setNotifications,
  ] = useState(() =>
    localStorage.getItem(
      "sicsi_admin_notifications"
    ) !== "false"
  );

  useEffect(() => {
    setName(
      user?.name || ""
    );

    setEmail(
      user?.email || ""
    );
  }, [user]);

  const nome =
    user?.name ||
    name ||
    "Administrador SICSI";

  const emailActual =
    user?.email ||
    email ||
    "Sem email";

  const iniciais =
    useMemo(
      () => obterIniciais(nome),
      [nome]
    );

  const papel =
    user?.role === "admin"
      ? TEXTOS.admin
      : "Utilizador";

  const nivel =
    user?.awareness_level ||
    TEXTOS.admin;

  function mostrarMensagem(
    texto,
    tipo = "success"
  ) {
    setMessage(texto);
    setMessageType(tipo);

    window.setTimeout(
      () => setMessage(""),
      4500
    );
  }

  function guardarPerfil(
    event
  ) {
    event.preventDefault();

    const nomeLimpo =
      name.trim();

    const emailLimpo =
      email.trim();

    if (!nomeLimpo) {
      mostrarMensagem(
        "Introduza o nome do administrador.",
        "error"
      );
      return;
    }

    if (!emailLimpo) {
      mostrarMensagem(
        "Introduza o email do administrador.",
        "error"
      );
      return;
    }

    setSaving(true);

    try {
      const actualizado = {
        ...user,
        name: nomeLimpo,
        email: emailLimpo,
      };

      updateUser(
        actualizado
      );

      localStorage.setItem(
        "sicsi_user",
        JSON.stringify(
          actualizado
        )
      );

      mostrarMensagem(
        "Dados administrativos actualizados com sucesso.",
        "success"
      );
    } catch {
      mostrarMensagem(
        "Não foi possível actualizar os dados.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  function alternarDicas(
    valor
  ) {
    setShowTips(valor);

    localStorage.setItem(
      "sicsi_admin_security_tips",
      String(valor)
    );
  }

  function alternarInterface(
    valor
  ) {
    setInterfaceEnabled(valor);

    localStorage.setItem(
      "sicsi_admin_interface_enabled",
      String(valor)
    );

    window.dispatchEvent(
      new Event(
        "sicsi-interface-change"
      )
    );
  }

  function alternarNotificacoes(
    valor
  ) {
    setNotifications(valor);

    localStorage.setItem(
      "sicsi_admin_notifications",
      String(valor)
    );
  }

  function actualizarSessao() {
    const actual =
      refreshUser();

    if (actual) {
      setName(
        actual.name || ""
      );

      setEmail(
        actual.email || ""
      );

      mostrarMensagem(
        "Dados da conta actualizados.",
        "success"
      );
    } else {
      mostrarMensagem(
        "Não foi possível actualizar os dados da conta.",
        "error"
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-2xl shadow-blue-600/20 lg:p-8">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative grid gap-7 xl:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-blue-100">
              <Settings
                size={18}
              />

              <span className="text-[11px] font-black uppercase tracking-[0.18em]">
                {TEXTOS.administracao}
              </span>
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight lg:text-4xl">
              {TEXTOS.definicoes}
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 lg:text-base">
              Gerencie o seu perfil administrativo, reveja as principais informa&ccedil;&otilde;es e mantenha a conta protegida.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black backdrop-blur">
                <ShieldCheck
                  size={14}
                />
                {TEXTOS.proteccao} {TEXTOS.activa}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black backdrop-blur">
                <UserRound
                  size={14}
                />
                {papel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-white/15 text-2xl font-black shadow-xl">
              {iniciais}

              <span className="absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full border-2 border-blue-600 bg-emerald-400" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-100">
                {TEXTOS.perfil}
              </p>

              <h2 className="mt-1 truncate text-xl font-black">
                {nome}
              </h2>

              <p className="mt-1 flex items-center gap-2 truncate text-sm text-blue-100">
                <Mail size={14} />
                {emailActual}
              </p>

              <p className="mt-3 text-xs font-bold text-blue-100">
                N&iacute;vel: {nivel}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          MENSAGEM
      ====================================================== */}

      {message ? (
        <div
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${
            messageType ===
            "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {messageType ===
          "error" ? (
            <Shield
              size={18}
            />
          ) : (
            <CheckCircle2
              size={18}
            />
          )}

          {message}
        </div>
      ) : null}

      {/* ======================================================
          CONTEÚDO
      ====================================================== */}

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        {/* DADOS */}

        <form
          onSubmit={
            guardarPerfil
          }
          className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <User size={20} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-600">
                  Perfil
                </p>

                <h2 className="text-lg font-black text-slate-950">
                  Dados pessoais
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Informação básica da conta administrativa.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Campo
                label="Nome completo"
                icon={User}
                value={name}
                onChange={
                  setName
                }
              />

              <Campo
                label="Email"
                icon={Mail}
                value={email}
                onChange={
                  setEmail
                }
                type="email"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoLinha
                icon={
                  ShieldCheck
                }
                label="Perfil"
                value={papel}
              />

              <InfoLinha
                icon={
                  Activity
                }
                label="Nível"
                value={nivel}
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">
                As alterações são aplicadas à conta administrativa actual.
              </p>

              <button
                type="submit"
                disabled={
                  saving
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={16} />
                )}

                {saving
                  ? "A guardar..."
                  : "Guardar alterações"}
              </button>
            </div>
          </div>
        </form>

        {/* SEGURANÇA */}

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Lock size={20} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">
                  Segurança
                </p>

                <h2 className="text-lg font-black text-slate-950">
                  Segurança da conta
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Estado e boas práticas administrativas.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-5 sm:p-6">
            <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                  <ShieldCheck
                    size={18}
                  />
                </div>

                <div>
                  <p className="text-sm font-black text-emerald-950">
                    Conta protegida
                  </p>

                  <p className="mt-0.5 text-xs text-emerald-700">
                    Conta administrativa activa.
                  </p>
                </div>
              </div>

              <CheckCircle2
                size={20}
                className="text-emerald-600"
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <KeyRound
                    size={18}
                  />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-900">
                    Acesso administrativo
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Papel actual: {papel}
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black text-blue-700">
                ACTIVO
              </span>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Shield
                  size={17}
                  className="text-blue-600"
                />

                <div>
                  <p className="text-sm font-black text-slate-900">
                    Recomenda&ccedil;&atilde;o
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Utilize credenciais fortes e mantenha a conta administrativa protegida.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ======================================================
          BOAS PRÁTICAS
      ====================================================== */}

      {showTips ? (
        <section className="overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Shield
                size={20}
              />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-600">
                SICSI III
              </p>

              <h2 className="text-lg font-black text-slate-950">
                Boas práticas administrativas
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
              <CheckCircle2
                size={18}
                className="text-emerald-600"
              />

              <p className="mt-3 text-sm font-black text-slate-900">
                Proteja as credenciais
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Nunca partilhe palavras-passe ou acessos administrativos.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
              <CheckCircle2
                size={18}
                className="text-emerald-600"
              />

              <p className="mt-3 text-sm font-black text-slate-900">
                Reveja os utilizadores
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Conceda privilégios administrativos apenas quando necessário.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
              <CheckCircle2
                size={18}
                className="text-emerald-600"
              />

              <p className="mt-3 text-sm font-black text-slate-900">
                Encerre o acesso
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Encerre o acesso administrativo quando concluir o trabalho.
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}