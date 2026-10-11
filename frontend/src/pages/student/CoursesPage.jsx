import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CirclePlay,
  Clock3,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { courseService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const levels = [
  "Básico",
  "Básico / Intermédio",
  "Intermédio",
  "Intermédio",
  "Avançado",
];

const courseImages = [
  "https://images.pexels.com/photos/1181251/pexels-photo-1181251.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/5905958/pexels-photo-5905958.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/5940714/pexels-photo-5940714.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6238136/pexels-photo-6238136.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/5905749/pexels-photo-5905749.jpeg?auto=compress&cs=tinysrgb&w=1200",
];

export default function CoursesPage() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        setLoading(true);
        setError("");

        const data = await courseService.getCourses();

        if (active) {
          setCourses(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              "Não foi possível carregar os cursos."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const completed = courses.filter((course) =>
      user?.completed_courses?.includes(course.id)
    ).length;

    const enrolled = courses.filter((course) =>
      user?.enrolled_courses?.includes(course.id)
    ).length;

    const lessons = courses.reduce(
      (total, course) =>
        total +
        Number(
          course.lessons_count ||
            course.lessons?.length ||
            0
        ),
      0
    );

    return {
      completed,
      enrolled,
      lessons,
    };
  }, [courses, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-72 rounded-[2rem] bg-slate-200" />

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 rounded-2xl bg-white"
              />
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-48 rounded-3xl bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HERO — MESMA LINGUAGEM DO DASHBOARD */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-600 to-blue-800 text-white shadow-[0_24px_70px_-35px_rgba(37,99,235,0.55)]">
          <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/2 h-72 w-72 rounded-full bg-blue-300/10 blur-3xl" />

          <div className="relative grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1fr_360px] lg:px-12 lg:py-11">

            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] backdrop-blur-md">
                <Sparkles size={14} />
                Formação SICSI III
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.03] tracking-[-0.045em] sm:text-5xl lg:text-[3.4rem]">
                Aprenda a proteger
                <span className="block text-blue-100">
                  o seu mundo digital.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">
                Desenvolva competências práticas para
                reconhecer ameaças, proteger as suas contas
                e tomar decisões mais seguras no ambiente
                digital.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
              <ShieldCheck
                size={34}
                className="text-white"
              />

              <p className="mt-5 text-xl font-black">
                Aprenda.
              </p>

              <p className="text-xl font-black text-blue-100">
                Pratique.
              </p>

              <p className="text-xl font-black">
                Proteja.
              </p>

              <p className="mt-4 text-sm leading-6 text-blue-50/90">
                Complete as aulas e faça o teste final
                para conquistar o seu certificado.
              </p>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <BookOpen size={21} />
              </div>

              <div>
                <p className="text-2xl font-black text-slate-950">
                  {courses.length}
                </p>

                <p className="text-xs font-medium text-slate-500">
                  Cursos disponíveis
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <CirclePlay size={21} />
              </div>

              <div>
                <p className="text-2xl font-black text-slate-950">
                  {stats.lessons}
                </p>

                <p className="text-xs font-medium text-slate-500">
                  Aulas disponíveis
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <GraduationCap size={21} />
              </div>

              <div>
                <p className="text-2xl font-black text-slate-950">
                  {stats.completed}
                </p>

                <p className="text-xs font-medium text-slate-500">
                  Cursos concluídos
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* CURSOS */}
        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Percurso de aprendizagem
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                Os seus cursos
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              {stats.enrolled} curso
              {stats.enrolled !== 1 ? "s" : ""} iniciado
              {stats.enrolled !== 1 ? "s" : ""}
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-slate-300" />

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Ainda não existem cursos publicados
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Os cursos disponibilizados pela SICSI
                aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course, index) => {
                const enrolled =
                  user?.enrolled_courses?.includes(
                    course.id
                  );

                const completed =
                  user?.completed_courses?.includes(
                    course.id
                  );

                const lessonCount = Number(
                  course.lessons_count ||
                    course.lessons?.length ||
                    10
                );

                const completedLessonIds =
                  user?.completed_lessons?.[course.id] ||
                  [];

                const completedLessonsCount = completed
                  ? lessonCount
                  : completedLessonIds.filter((id) =>
                      course.lessons?.some(
                        (lesson) =>
                          lesson.id === id
                      )
                    ).length;

                const progress = lessonCount
                  ? Math.round(
                      (completedLessonsCount /
                        lessonCount) *
                        100
                    )
                  : 0;

                const image =
                  course.image_url ||
                  course.image ||
                  courseImages[
                    index % courseImages.length
                  ];

                return (
                  <Link
                    key={course.id}
                    to={`/student/cursos/${course.id}`}
                    className="group relative block overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl"
                  >
                    <div className="flex flex-col md:flex-row md:items-stretch">

                      <div className="relative h-44 w-full shrink-0 overflow-hidden md:absolute md:inset-y-0 md:left-0 md:h-auto md:w-52 lg:w-56">
                        <img
                          src={image}
                          alt={course.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />

                        <div className="absolute bottom-4 left-4">
                          <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-slate-700 shadow-sm">
                            {levels[index] ||
                              course.level ||
                              "Intermédio"}
                          </span>
                        </div>

                        {completed && (
                          <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-[10px] font-black text-white shadow-lg">
                            <CheckCircle2 size={13} />
                            Concluído
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 p-5 md:ml-52 lg:ml-56">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                          <div className="min-w-0 flex-1">
                            <h3 className="text-xl font-black tracking-tight text-slate-950 transition group-hover:text-blue-700">
                              {course.title}
                            </h3>

                            <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">
                              {course.description}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                              <span className="inline-flex items-center gap-1.5">
                                <BookOpen size={14} />
                                {lessonCount} aulas
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 size={14} />
                                Teste final
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <GraduationCap size={14} />
                                Certificado ≥70%
                              </span>
                            </div>
                          </div>

                          <div className="w-full shrink-0 lg:w-56">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-500">
                                {progress}% concluído
                              </span>

                              <span className="font-bold text-blue-600">
                                {completed
                                  ? "Finalizado"
                                  : enrolled
                                  ? "Em progresso"
                                  : "Novo"}
                              </span>
                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                style={{
                                  width: `${progress}%`,
                                }}
                              />
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-xs text-slate-400">
                                {completedLessonsCount}/
                                {lessonCount} aulas
                              </span>

                              <span className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition group-hover:bg-blue-700">
                                {completed
                                  ? "Rever"
                                  : enrolled
                                  ? "Continuar"
                                  : "Começar"}

                                <ArrowRight size={15} />
                              </span>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                    <div className="h-1 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
              <GraduationCap size={24} />
            </div>

            <div>
              <h3 className="font-black text-slate-950">
                Complete um curso e conquiste o seu certificado.
              </h3>

              <p className="mt-1 text-sm leading-5 text-slate-600">
                Conclua todas as aulas e obtenha pelo menos
                70% no teste final. O certificado é gerado
                automaticamente.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}