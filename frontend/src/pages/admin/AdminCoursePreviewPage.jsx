import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileQuestion,
  Layers3,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

const API_BASE =
  "http://127.0.0.1:8000/api";

export default function AdminCoursePreviewPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [erro, setErro] =
    useState("");

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        setErro("");

        const resposta =
          await fetch(
            `${API_BASE}/courses/${courseId}`
          );

        const dados =
          await resposta
            .json()
            .catch(() => null);

        if (!resposta.ok) {
          throw new Error(
            dados?.detail ||
              "Não foi possível carregar o curso."
          );
        }

        setCurso(dados);

      } catch (error) {
        setErro(
          error?.message ||
            "Não foi possível carregar o curso."
        );
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      carregar();
    }
  }, [courseId]);


  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
          <LoaderCircle className="h-5 w-5 animate-spin text-blue-600" />
          A carregar pré-visualização...
        </div>
      </section>
    );
  }


  if (erro || !curso) {
    return (
      <section className="mx-auto w-full max-w-4xl py-10">
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6">

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-red-600">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <h1 className="mt-5 text-xl font-black text-red-700">
            Não foi possível abrir o curso
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {erro || "Curso não encontrado."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/cursos")
            }
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos cursos
          </button>

        </div>
      </section>
    );
  }


  const aulas =
    Array.isArray(curso.lessons)
      ? curso.lessons
      : [];

  const perguntas =
    Array.isArray(curso.questions)
      ? curso.questions
      : [];


  return (
    <section className="w-full space-y-6">

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

        <button
          type="button"
          onClick={() =>
            navigate("/admin/cursos")
          }
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos cursos
        </button>


        {curso.link && (
          <a
            href={curso.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
          >
            Abrir link do curso
            <ExternalLink className="h-4 w-4" />
          </a>
        )}

      </div>


      <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">

        <div className="relative h-56 overflow-hidden bg-slate-900 sm:h-80">

          {curso.image_url ? (
            <img
              src={curso.image_url}
              alt={curso.title}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.opacity =
                  "0";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-blue-300">
              <ShieldCheck className="h-16 w-16" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

          <div className="absolute bottom-6 left-5 right-5 sm:left-7 sm:right-7">

            <span className="inline-flex rounded-full bg-white/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white backdrop-blur">
              Pré-visualização administrativa
            </span>

            <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
              {curso.title}
            </h1>

          </div>

        </div>


        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_280px]">

          <div>

            <p className="text-sm leading-7 text-slate-600">
              {curso.description ||
                "Sem descrição definida."}
            </p>


            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-black text-slate-700">
                    Aulas
                  </span>
                </div>

                <p className="mt-2 text-2xl font-black text-slate-950">
                  {aulas.length}
                </p>
              </div>


              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-black text-slate-700">
                    Perguntas
                  </span>
                </div>

                <p className="mt-2 text-2xl font-black text-slate-950">
                  {perguntas.length}/10
                </p>
              </div>

            </div>

          </div>


          <aside className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-sm font-black text-slate-950">
              Estado do curso
            </h2>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700">

              <span
                className={`h-2 w-2 rounded-full ${
                  curso.published
                    ? "bg-emerald-500"
                    : "bg-slate-400"
                }`}
              />

              {curso.published
                ? "Publicado"
                : "Rascunho"}

            </div>


            {perguntas.length === 10 && (
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Teste completo
              </div>
            )}

          </aside>

        </div>

      </article>


      {aulas.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">

          <h2 className="text-lg font-black text-slate-950">
            Aulas do curso
          </h2>

          <div className="mt-5 space-y-3">

            {aulas.map(
              (aula, index) => (
                <div
                  key={
                    aula.id ||
                    index
                  }
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >

                  <div className="min-w-0">

                    <span className="text-[9px] font-black uppercase tracking-[0.14em] text-blue-600">
                      Aula{" "}
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <p className="mt-1 truncate text-sm font-bold text-slate-800">
                      {aula.title}
                    </p>

                  </div>


                  {aula.video_url && (
                    <a
                      href={
                        aula.video_url
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 shrink-0 items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 text-[11px] font-bold text-blue-700 transition hover:bg-blue-50"
                    >
                      Abrir vídeo
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                </div>
              )
            )}

          </div>

        </section>
      )}


      {perguntas.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">

          <div className="flex items-center justify-between gap-4">

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-indigo-600">
                Teste final
              </p>

              <h2 className="mt-1 text-lg font-black text-slate-950">
                Perguntas do curso
              </h2>
            </div>

            <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-700">
              {perguntas.length}/10
            </span>

          </div>


          <div className="mt-6 space-y-5">

            {perguntas.map(
              (pergunta, index) => (
                <article
                  key={
                    pergunta.id ||
                    index
                  }
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >

                  <p className="text-sm font-black leading-6 text-slate-900">
                    {index + 1}.{" "}
                    {pergunta.question}
                  </p>


                  <div className="mt-3 grid gap-2 sm:grid-cols-2">

                    {(Array.isArray(
                      pergunta.options
                    )
                      ? pergunta.options
                      : []
                    ).map(
                      (
                        opcao,
                        opcaoIndex
                      ) => {

                        const correcta =
                          Number(
                            pergunta.correct_answer
                          ) ===
                          opcaoIndex;

                        return (
                          <div
                            key={
                              opcaoIndex
                            }
                            className={`rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                              correcta
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white text-slate-600"
                            }`}
                          >

                            <span className="mr-2 font-black">
                              {String.fromCharCode(
                                65 +
                                  opcaoIndex
                              )}
                              .
                            </span>

                            {opcao}

                            {correcta && (
                              <span className="ml-2 text-[9px] font-black uppercase">
                                correcta
                              </span>
                            )}

                          </div>
                        );
                      }
                    )}

                  </div>


                  {pergunta.explanation && (
                    <p className="mt-3 rounded-xl bg-white px-3 py-2.5 text-xs leading-5 text-slate-500">

                      <strong className="text-slate-700">
                        Explicação:
                      </strong>{" "}

                      {pergunta.explanation}

                    </p>
                  )}

                </article>
              )
            )}

          </div>

        </section>
      )}

    </section>
  );
}
