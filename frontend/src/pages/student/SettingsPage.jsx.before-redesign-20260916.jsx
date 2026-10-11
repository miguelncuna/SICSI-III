import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
  const { user, updateUser } =
    useAuth();

  const [name, setName] =
    useState(user?.name || "");

  const [email, setEmail] =
    useState(user?.email || "");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  function saveProfile(event) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage(
        "Informe o seu nome."
      );
      return;
    }

    const updated = {
      ...user,
      name: name.trim(),
      email: email.trim(),
    };

    updateUser(updated);

    localStorage.setItem(
      "sicsi_user",
      JSON.stringify(updated)
    );

    setMessage(
      "Dados da conta atualizados nesta sessão."
    );
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-blue-400">
          Conta
        </p>

        <h1 className="mt-2 text-3xl font-black">
          Definições
        </h1>

        <p className="mt-2 text-slate-500">
          Consulte e atualize os seus dados pessoais.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
          <form
            onSubmit={saveProfile}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-500">
                <User size={22} />
              </div>

              <div>
                <h2 className="font-bold">
                  Dados pessoais
                </h2>

                <p className="text-sm text-slate-500">
                  Informação básica da sua conta.
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-5">
              <Field
                label="Nome completo"
                icon={User}
                value={name}
                onChange={setName}
              />

              <Field
                label="Email"
                icon={Mail}
                type="email"
                value={email}
                onChange={setEmail}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Nova palavra-passe
                </label>

                <div className="relative">
                  <Lock
                    size={17}
                    className="absolute left-3 top-3.5 text-slate-600"
                  />

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Deixe vazio para manter"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {message && (
              <div className="mt-5 rounded-xl bg-blue-500/10 p-4 text-sm text-blue-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
            >
              <Save size={17} />
              Guardar alterações
            </button>
          </form>

          <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck
                className="text-blue-500"
                size={25}
              />

              <h2 className="font-bold">
                Conta SICSI
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              <Info
                label="Função"
                value={
                  user?.role === "admin"
                    ? "Administrador"
                    : "Estudante"
                }
              />

              <Info
                label="Nível"
                value={
                  user?.awareness_level ||
                  "Não avaliado"
                }
              />

              <Info
                label="Email"
                value={user?.email}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={17}
          className="absolute left-3 top-3.5 text-slate-600"
        />

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-3 text-sm outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-950 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold">
        {value || "—"}
      </p>
    </div>
  );
}
