import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { authService } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";

const benefits = [
  "Descubra o seu nível de consciência digital",
  "Receba um percurso orientado de aprendizagem",
  "Pratique através de experiências interactivas",
  "Acompanhe a sua evolução no SICSI III",
];

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-slate-800"
      >
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          id={id}
          type={show ? "text" : "password"}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={
            show
              ? "Ocultar palavra-passe"
              : "Mostrar palavra-passe"
          }
        >
          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
    const { showNotification } = useNotification();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("As palavras-passe não coincidem.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "A palavra-passe deve ter pelo menos 6 caracteres."
      );
      return;
    }

    setLoading(true);

    try {
      const data = await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      login(data.user);    
      showNotification({
        type: "success",
        title: "Conta criada com sucesso",
        message: "A sua conta foi criada com sucesso.",
        duration: 10000,
      });

      navigate("/student/autoavaliacao");
    } catch (err) {
      setError(
        err?.message ||
          "Não foi possível criar a sua conta."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[0.98fr_1.02fr]">
        {/* FORM */}
        <section className="relative order-2 flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:order-1 lg:px-12">
          <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-blue-50 blur-3xl" />

          <div className="relative w-full max-w-md">
            <div className="mb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <ShieldCheck size={23} />
                </div>

                <div>
                  <p className="font-black text-slate-950">
                    SICSI III
                  </p>

                  <p className="text-[11px] font-semibold text-slate-500">
                    Segurança Digital
                  </p>
                </div>
              </Link>
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
              Comece aqui
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Crie a sua conta.
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Dê o primeiro passo para desenvolver uma consciência digital
              mais forte.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700"
              >
                <p className="font-bold">
                  Verifique os dados
                </p>

                <p className="mt-1">
                  {error}
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="register-name"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Nome completo
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="register-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    placeholder="O seu nome completo"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="register-email"
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
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <PasswordField
                id="register-password"
                label="Palavra-passe"
                value={form.password}
                onChange={(event) =>
                  setForm({
                    ...form,
                    password: event.target.value,
                  })
                }
                show={showPassword}
                onToggle={() =>
                  setShowPassword((value) => !value)
                }
                autoComplete="new-password"
              />

              <PasswordField
                id="register-confirm-password"
                label="Confirmar palavra-passe"
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm({
                    ...form,
                    confirmPassword: event.target.value,
                  })
                }
                show={showConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword(
                    (value) => !value
                  )
                }
                autoComplete="new-password"
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex gap-3">
                  <LockKeyhole
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Palavra-passe segura
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Utilize pelo menos 6 caracteres e evite partilhar as
                      suas credenciais.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    A criar conta...
                  </>
                ) : (
                  <>
                    Criar a minha conta
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Já tem uma conta?{" "}
              <Link
                to="/login"
                className="font-black text-blue-600 transition hover:text-blue-700"
              >
                Entrar
              </Link>
            </p>

            <Link
              to="/"
              className="mx-auto mt-5 block w-fit text-xs font-semibold text-slate-400 transition hover:text-blue-600"
            >
              Voltar à página inicial
            </Link>
          </div>
        </section>

        {/* VISUAL */}
        <section className="relative order-1 hidden overflow-hidden bg-blue-950 lg:order-2 lg:block">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=90"
            alt="Estudantes em aprendizagem"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-950/55 to-blue-900/20" />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.10)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="relative flex min-h-screen flex-col justify-between p-10 xl:p-14">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-700 shadow-lg">
                <ShieldCheck size={25} />
              </div>

              <div>
                <p className="text-lg font-black text-white">
                  SICSI III
                </p>

                <p className="text-xs font-semibold text-blue-200">
                  Segurança Digital
                </p>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="mb-6 h-1 w-20 rounded-full bg-blue-400" />

              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-300">
                O seu percurso começa aqui.
              </p>

              <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white xl:text-6xl">
                Aprenda. Pratique. Esteja preparado.
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-blue-100/80 xl:text-lg">
                Ao criar a sua conta, começa por descobrir o seu nível de
                consciência digital e passa a ter acesso ao seu percurso de
                aprendizagem.
              </p>

              <div className="mt-8 grid gap-3">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-start gap-3 text-sm text-blue-50"
                  >
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-blue-300"
                    />

                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs font-medium text-blue-200/60">
              Conhecimento · Consciência · Acção
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}




