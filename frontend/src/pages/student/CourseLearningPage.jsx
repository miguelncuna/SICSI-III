import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  ListVideo,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { courseService } from "../../services/api";

function getVideoEmbedUrl(url) {
  if (!url) {
    return "";
  }

  const value = String(url).trim();

  try {
    const parsed = new URL(value);

    const hostname =
      parsed.hostname.toLowerCase();

    // YouTube normal
    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com"
    ) {
      if (
        parsed.pathname === "/watch"
      ) {
        const id =
          parsed.searchParams.get(
            "v"
          );

        if (id) {
          return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
        }
      }

      if (
        parsed.pathname.startsWith(
          "/embed/"
        )
      ) {
        return value;
      }

      if (
        parsed.pathname.startsWith(
          "/shorts/"
        )
      ) {
        const id =
          parsed.pathname
            .split("/")
            .filter(Boolean)[1];

        if (id) {
          return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
        }
      }
    }

    // YouTube curto
    if (
      hostname === "youtu.be"
    ) {
      const id =
        parsed.pathname
          .split("/")
          .filter(Boolean)[0];

      if (id) {
        return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
      }
    }

    // YouTube nocookie
    if (
      hostname ===
        "www.youtube-nocookie.com" &&
      parsed.pathname.startsWith(
        "/embed/"
      )
    ) {
      return value;
    }

    // Vimeo
    if (
      hostname === "vimeo.com" ||
      hostname === "www.vimeo.com"
    ) {
      const partes =
        parsed.pathname
          .split("/")
          .filter(Boolean);

      const id =
        partes[partes.length - 1];

      if (
        id &&
        /^\d+$/.test(id)
      ) {
        return `https://player.vimeo.com/video/${id}`;
      }
    }

    // Vimeo player
    if (
      hostname ===
        "player.vimeo.com"
    ) {
      return value;
    }

    // Outros links HTTP/HTTPS.
    // O navegador tentar? abrir a p?gina
    // directamente no iframe quando permitido.
    if (
      parsed.protocol ===
        "http:" ||
      parsed.protocol ===
        "https:"
    ) {
      return value;
    }
  } catch {
    return "";
  }

  return "";
}

export default function CourseLearningPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [course, setCourse] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCourse() {
      try {
        setLoading(true);
        setError("");

        const data = await courseService.getCourse(courseId);

        if (!active) {
          return;
        }

        setCourse(data);

        const storedCompleted =
          user?.completed_lessons?.[courseId] || [];

        setCompletedLessons(
          Array.isArray(storedCompleted)
            ? storedCompleted
            : []
        );
      } catch (err) {
        if (active) {
          setError(
            err.message || "Não foi possível carregar o curso."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      active = false;
    };
  }, [courseId]);

  const lessons = useMemo(() => {
    if (!course?.lessons) {
      return [];
    }

    return [...course.lessons].sort(
      (a, b) =>
        Number(a.order || 0) - Number(b.order || 0)
    );
  }, [course]);

  const currentLesson = lessons[currentIndex] || null;

  const completedCount = completedLessons.filter((id) =>
    lessons.some((lesson) => lesson.id === id)
  ).length;

  const progress = lessons.length
    ? Math.round((completedCount / lessons.length) * 100)
    : 0;

  const isCurrentCompleted =
    currentLesson &&
    completedLessons.includes(currentLesson.id);

  async function completeCurrentLesson() {
    if (!currentLesson || !user?.id || saving) {
      return false;
    }

    if (completedLessons.includes(currentLesson.id)) {
      return true;
    }

    try {
      setSaving(true);
      setError("");

      const result = await courseService.completeLesson(
        courseId,
        user.id,
        currentLesson.id
      );

      const updatedCompleted =
        Array.isArray(result.completed_lessons)
          ? result.completed_lessons
          : [...completedLessons, currentLesson.id];

      setCompletedLessons(updatedCompleted);

      updateUser({
        ...user,
        completed_lessons: {
          ...(user.completed_lessons || {}),
          [courseId]: updatedCompleted,
        },
        ...(result.course_completed
          ? {
              completed_courses: [
                ...(user.completed_courses || []).filter(
                  (id) => id !== courseId
                ),
                courseId,
              ],
            }
          : {}),
      });

      return true;
    } catch (err) {
      setError(
        err.message ||
          "Não foi possível guardar o progresso desta aula."
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function nextLesson() {
    if (!currentLesson) {
      return;
    }

    const completed = await completeCurrentLesson();

    if (!completed) {
      return;
    }

    if (currentIndex < lessons.length - 1) {
      setCurrentIndex((index) => index + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    navigate(`/student/cursos/${courseId}/teste`);
  }

  function previousLesson() {
    if (currentIndex === 0) {
      return;
    }

    setCurrentIndex((index) => index - 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goToLesson(index) {
    if (index < 0 || index >= lessons.length) {
      return;
    }

    setCurrentIndex(index);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-5 w-36 rounded bg-slate-200" />
          <div className="mt-5 aspect-video rounded-3xl bg-slate-200" />
          <div className="mt-4 h-40 rounded-3xl bg-white" />
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />

          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Não foi possível carregar o curso
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate("/student/cursos")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft size={16} />
            Voltar aos cursos
          </button>
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-12 w-12 text-blue-600" />

          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Curso sem aulas disponíveis
          </h1>
        </div>
      </div>
    );
  }

  const embedUrl = getVideoEmbedUrl(
    currentLesson.video_url
  );

  const previousIndex = currentIndex - 1;
  const nextIndex = currentIndex + 1;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* BACK */}
        <button
          type="button"
          onClick={() => navigate("/student/cursos")}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Voltar aos cursos
        </button>

        {/* VIDEO */}
        <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-950 shadow-xl">
          <div className="aspect-video w-full max-h-[68vh]">
            {embedUrl ? (
              <iframe
                key={embedUrl}
                src={embedUrl}
                title={currentLesson.title}
                className="h-full w-full"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center text-white">
                <div>
                  <PlayCircle className="mx-auto h-14 w-14 text-slate-500" />

                  <p className="mt-4 font-bold">
                    Vídeo indisponível
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    O endereço do vídeo desta aula não é válido.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* LESSON HEADER BELOW VIDEO */}
        <section className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-6">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                    Aula {currentIndex + 1} de {lessons.length}
                  </span>

                  {isCurrentCompleted && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      <Check size={13} />
                      Concluída
                    </span>
                  )}
                </div>

                <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  {currentLesson.title}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  {course.title}
                </p>
              </div>

              <div className="w-full shrink-0 lg:w-64">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">
                    Progresso
                  </span>

                  <span className="font-black text-blue-600">
                    {progress}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-right text-[11px] font-medium text-slate-400">
                  {completedCount} de {lessons.length} aulas concluídas
                </p>
              </div>
            </div>
          </div>

          {/* DESKTOP LESSON NAVIGATION */}
          <div className="hidden border-t border-slate-100 px-5 py-4 sm:px-6 md:block">
            <div className="flex items-center gap-3">
              <div className="flex shrink-0 items-center gap-2 text-xs font-black text-slate-700">
                <ListVideo size={17} className="text-blue-600" />
                Aulas
              </div>

              <div className="flex flex-1 items-center justify-center gap-2">
                {lessons.map((lesson, index) => {
                  const completed =
                    completedLessons.includes(lesson.id);

                  const active =
                    index === currentIndex;

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => goToLesson(index)}
                      title={lesson.title}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-black transition ${
                        active
                          ? "bg-blue-600 text-white shadow-sm"
                          : completed
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600"
                      }`}
                    >
                      {completed && !active ? (
                        <Check size={14} />
                      ) : (
                        index + 1
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MOBILE / TABLET LESSON NAVIGATION */}
          <div className="border-t border-slate-100 p-4 md:hidden">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToLesson(previousIndex)}
                disabled={currentIndex === 0}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Aula anterior"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="min-w-0 flex-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <ListVideo size={16} className="text-blue-600" />

                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Aulas
                  </span>
                </div>

                <p className="mt-1 truncate text-sm font-black text-slate-950">
                  Aula {currentIndex + 1} de {lessons.length}
                </p>

                <p className="mt-0.5 truncate text-[11px] text-slate-400">
                  {currentLesson.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => goToLesson(nextIndex)}
                disabled={currentIndex === lessons.length - 1}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Próxima aula"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5">
              {lessons.map((lesson, index) => {
                const completed =
                  completedLessons.includes(lesson.id);

                const active =
                  index === currentIndex;

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => goToLesson(index)}
                    aria-label={`Ir para aula ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      active
                        ? "w-7 bg-blue-600"
                        : completed
                          ? "w-2 bg-emerald-400"
                          : "w-2 bg-slate-200"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* LESSON INFORMATION */}
        <section className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className="hidden shrink-0 rounded-2xl bg-blue-50 p-3 text-blue-600 sm:block">
              <CirclePlay size={22} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">
                Conteúdo da aula
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Assista ao vídeo e avance quando estiver preparado para
                concluir esta aula.
              </p>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <AlertCircle
              className="mt-0.5 shrink-0"
              size={18}
            />

            <span>{error}</span>
          </div>
        )}

        {/* PREVIOUS / NEXT */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={previousLesson}
            disabled={currentIndex === 0 || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={17} />
            Aula anterior
          </button>

          <button
            type="button"
            onClick={nextLesson}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "A guardar..."
              : currentIndex === lessons.length - 1
                ? "Concluir e fazer teste"
                : "Concluir e próxima aula"}

            {currentIndex === lessons.length - 1 ? (
              <CheckCircle2 size={17} />
            ) : (
              <ArrowRight size={17} />
            )}
          </button>
        </div>

        {/* FINAL TEST MESSAGE */}
        <section className="mt-5 flex items-start gap-4 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 sm:p-6">
          <div className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm">
            <CirclePlay size={22} />
          </div>

          <div>
            <p className="font-black text-slate-950">
              Próximo passo
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {currentIndex === lessons.length - 1
                ? "Esta é a última aula. Ao concluí-la, poderá realizar o teste final."
                : `Faltam ${
                    lessons.length - completedCount
                  } aula${
                    lessons.length - completedCount !== 1
                      ? "s"
                      : ""
                  } para chegar ao teste final.`}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}