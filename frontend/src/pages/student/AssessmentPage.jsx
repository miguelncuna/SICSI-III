import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleCheck,
  Loader2,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function getErrorMessage(error, fallback = "Ocorreu um erro. Tente novamente.") {
  const detail = error?.response?.data?.detail ?? error?.message;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || item?.message || String(item))
      .join(" ");
  }

  if (detail && typeof detail === "object") {
    return detail.msg || detail.message || fallback;
  }

  return fallback;
}

function normalizeRecommendations(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        return item.title || item.name || item.course || "";
      }
      return "";
    })
    .filter(Boolean);
}

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadQuestions() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://127.0.0.1:8000/api/assessment/questions");

        if (!response.ok) {
          throw new Error("Não foi possível carregar a autoavaliação.");
        }

        const data = await response.json();

        if (!active) return;

        const loadedQuestions = Array.isArray(data)
          ? data
          : Array.isArray(data?.questions)
            ? data.questions
            : [];

        setQuestions(loadedQuestions);
        setAnswers(new Array(loadedQuestions.length).fill(""));
      } catch (err) {
        if (active) {
          setError(
            getErrorMessage(
              err,
              "Não foi possível carregar a autoavaliação. Verifique a ligação ao servidor."
            )
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadQuestions();

    return () => {
      active = false;
    };
  }, []);

  const currentQuestion = questions[currentIndex];

  const answeredCount = useMemo(
    () => answers.filter((answer) => answer !== "").length,
    [answers]
  );

  const progress =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;

  const questionProgress =
    questions.length > 0
      ? Math.round(((currentIndex + 1) / questions.length) * 100)
      : 0;

  function handleAnswer(value) {
    setAnswers((previous) => {
      const next = [...previous];
      next[currentIndex] = value;
      return next;
    });

    setError("");
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex((previous) => previous - 1);
      setError("");
    }
  }

  function handleNext() {
    if (!currentQuestion) return;

    if (answers[currentIndex] === "") {
      setError("Seleccione uma resposta antes de continuar.");
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((previous) => previous + 1);
      setError("");
    }
  }

  async function handleSubmit() {
    if (answers.some((answer) => answer === "")) {
      setError("Responda a todas as perguntas antes de concluir.");
      return;
    }

    if (!user?.id) {
      setError("Não foi possível identificar o utilizador autenticado.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const normalizedAnswers = answers.map((answer) => String(answer));

      const response = await fetch(
        "http://127.0.0.1:8000/api/assessment/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            answers: normalizedAnswers,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Não foi possível concluir a autoavaliação."
        );
      }

      const recommendations = normalizeRecommendations(
        data.recommendations
      );

      const updatedUser = {
        ...user,
        initial_assessment_completed: true,
        assessment_score: data.percentage ?? data.score ?? 0,
        awareness_level: data.level || "",
        recommendations,
      };

      updateUser(updatedUser);
      setResult({
        ...data,
        recommendations,
      });
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Não foi possível concluir a autoavaliação. Tente novamente."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/20">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>

          <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            A preparar a sua autoavaliação...
          </p>
        </div>
      </div>
    );
  }

  if (result) {
    const score = Number(result.percentage ?? result.score ?? 0);

    return (
      <div className="min-h-screen overflow-hidden bg-white">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-br from-blue-50 via-white to-sky-50" />

          <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-16">
            <div className="mx-auto max-w-4xl">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-600">
                    SICSI
                  </p>
                  <p className="text-xs text-slate-500">
                    Perfil de consciência digital
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
                <div className="border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-10 text-white sm:px-10">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>

                  <p className="mt-7 text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">
                    Autoavaliação concluída
                  </p>

                  <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                    O seu perfil de consciência digital está pronto.
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                    Este resultado ajuda o SICSI a orientar a sua aprendizagem
                    e apresentar conteúdos mais adequados ao seu nível actual.
                  </p>
                </div>

                <div className="grid gap-6 p-6 sm:p-10 md:grid-cols-[220px_1fr]">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-7 text-center ring-1 ring-slate-100">
                    <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-inner ring-8 ring-blue-50">
                      <div>
                        <p className="text-4xl font-bold text-blue-600">
                          {score}%
                        </p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                          resultado
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                        Nível identificado
                      </p>

                      <h2 className="mt-2 text-2xl font-bold text-slate-900">
                        {result.level || "Perfil identificado"}
                      </h2>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        A sua classificação será utilizada para orientar a
                        experiência de aprendizagem dentro do SICSI.
                      </p>
                    </div>

                    {result.recommendations?.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-blue-600" />
                          <h3 className="font-bold text-slate-900">
                            Recomendações para si
                          </h3>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {result.recommendations.map((recommendation, index) => (
                            <div
                              key={`${recommendation}-${index}`}
                              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                            >
                              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <Check className="h-4 w-4" />
                              </div>

                              <p className="text-sm font-medium leading-5 text-slate-700">
                                {recommendation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate("/student")}
                      className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl sm:w-auto"
                    >
                      Ir para o Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 px-5 py-10 sm:px-8">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <ShieldCheck className="h-7 w-7 text-red-500" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Não foi possível carregar
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-7 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative overflow-hidden bg-white">
        <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-sky-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-7 sm:px-8 lg:px-10 lg:pb-14 lg:pt-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>

              <div>
                <p className="text-sm font-bold tracking-tight text-slate-900">
                  SICSI
                </p>
                <p className="text-xs text-slate-500">
                  Segurança e consciência digital
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm sm:flex">
              <Target className="h-4 w-4 text-blue-600" />
              Avaliação inicial
            </div>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700">
                <Sparkles className="h-4 w-4" />
                Descubra o seu nível de consciência digital
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Conhecer o seu nível é o primeiro passo para{" "}
                <span className="text-blue-600">proteger-se melhor.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Responda às perguntas com base no que realmente faria em cada
                situação. Não é um exame de aprovação ou reprovação. O
                objectivo é compreender o seu nível actual e personalizar a
                sua aprendizagem.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Progresso
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {progress}%
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CircleCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-3 text-xs font-medium text-slate-500">
                {answeredCount} de {questions.length} perguntas respondidas
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <section>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                  Pergunta {currentIndex + 1}
                </p>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  de {questions.length}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold text-slate-400">
                  Progresso da avaliação
                </p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {questionProgress}%
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
              <div className="h-1.5 bg-slate-100">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${questionProgress}%` }}
                />
              </div>

              <div className="p-6 sm:p-9 lg:p-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <h2 className="mt-7 text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">
                  {currentQuestion?.question ||
                    currentQuestion?.text ||
                    currentQuestion?.title ||
                    ""}
                </h2>

                {currentQuestion?.description && (
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    {currentQuestion.description}
                  </p>
                )}

                <div className="mt-8 space-y-3">
                  {(currentQuestion?.options || []).map((option, optionIndex) => {
                    const value =
                      typeof option === "object"
                        ? String(option.id ?? option.value ?? optionIndex)
                        : String(optionIndex);

                    const label =
                      typeof option === "object"
                        ? option.text ?? option.label ?? option.title ?? ""
                        : option;

                    const selected = answers[currentIndex] === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleAnswer(value)}
                        className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5 ${
                          selected
                            ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                            : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${
                            selected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300 bg-white text-slate-500 group-hover:border-blue-400 group-hover:text-blue-600"
                          }`}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </span>

                        <span
                          className={`flex-1 pt-0.5 text-sm font-medium leading-6 sm:text-base ${
                            selected ? "text-blue-950" : "text-slate-700"
                          }`}
                        >
                          {label}
                        </span>

                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            selected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-transparent group-hover:bg-blue-100"
                          }`}
                        >
                          <Check className="h-4 w-4" />
                        </span>
                      </button>
                    );
                  })}
                </div>

                {error && (
                  <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium leading-5 text-red-700">
                    {error}
                  </div>
                )}

                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0 || submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Anterior
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Próxima pergunta
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          A calcular resultado...
                        </>
                      ) : (
                        <>
                          Concluir autoavaliação
                          <CheckCircle2 className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Percurso
                </p>

                <div className="mt-5 space-y-3">
                  {questions.map((_, index) => {
                    const answered = answers[index] !== "";
                    const active = index === currentIndex;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentIndex(index)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                          active
                            ? "bg-blue-50 text-blue-700"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            answered
                              ? "bg-blue-600 text-white"
                              : active
                                ? "border border-blue-200 bg-white text-blue-600"
                                : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {answered ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </span>

                        <span className="text-xs font-semibold">
                          Pergunta {index + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
                <ShieldCheck className="h-6 w-6 text-blue-600" />

                <h3 className="mt-4 font-bold text-slate-900">
                  Responda com honestidade
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Não procure acertar. As respostas servem para compreender o
                  seu nível e personalizar a experiência no SICSI.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}