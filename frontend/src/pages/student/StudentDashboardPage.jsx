import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CirclePlay,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { courseService, certificateService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const courseImages = {
  course_fundamentos_sicsi:
    "https://images.pexels.com/photos/1181251/pexels-photo-1181251.jpeg?auto=compress&cs=tinysrgb&w=800",

  course_contas_credenciais:
    "https://images.pexels.com/photos/5905958/pexels-photo-5905958.jpeg?auto=compress&cs=tinysrgb&w=800",

  course_phishing:
    "https://images.pexels.com/photos/5940714/pexels-photo-5940714.jpeg?auto=compress&cs=tinysrgb&w=800",

  course_engenharia_social:
    "https://images.pexels.com/photos/6238136/pexels-photo-6238136.jpeg?auto=compress&cs=tinysrgb&w=800",

  course_fraudes_avancada:
    "https://images.pexels.com/photos/5905749/pexels-photo-5905749.jpeg?auto=compress&cs=tinysrgb&w=800",
};
export default function StudentDashboardPage() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [certificateList, setCertificateList] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [coursesData, certificatesData] = await Promise.all([
          courseService.getCourses(),
          user?.id
            ? certificateService.getUserCertificates(user.id)
            : Promise.resolve([]),
        ]);

        if (!active) return;

        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setCertificateList(
          Array.isArray(certificatesData) ? certificatesData : []
        );
      } catch {
        if (!active) return;

        setCourses([]);
        setCertificateList([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [user?.id]);

  /*
   * ============================================================
   * CURSOS NO PERCURSO
   * ============================================================
   *
   * O Dashboard considera um curso como parte do percurso quando:
   * - está inscrito;
   * - possui aulas concluídas;
   * - ou está marcado como concluído.
   *
   * Isto evita perder o progresso quando os dados antigos do
   * utilizador ficaram desalinhados com a lista actual de cursos.
   */

  const enrolledCourseIds = Array.isArray(user?.enrolled_courses)
    ? user.enrolled_courses
    : [];

  const completedCourseIds = Array.isArray(user?.completed_courses)
    ? user.completed_courses
    : [];

  const completedLessons = user?.completed_lessons || {};

  const trackedCourses = useMemo(() => {
    const trackedIds = new Set([
      ...enrolledCourseIds,
      ...completedCourseIds,
      ...Object.keys(completedLessons),
    ]);

    return courses.filter((course) => trackedIds.has(course.id));
  }, [
    courses,
    enrolledCourseIds,
    completedCourseIds,
    completedLessons,
  ]);

  const completedCourseCount = useMemo(() => {
    return trackedCourses.filter((course) =>
      completedCourseIds.includes(course.id)
    ).length;
  }, [trackedCourses, completedCourseIds]);

  /*
   * ============================================================
   * PROGRESSO DAS AULAS
   * ============================================================
   */

  function getCourseLessonCount(course) {
    if (!course) return 0;

    if (Array.isArray(course.lessons) && course.lessons.length > 0) {
      return course.lessons.length;
    }

    return Number(course.lessons_count || 0);
  }

  function getCourseCompletedLessons(course) {
    if (!course) return [];

    const lessons = completedLessons?.[course.id];

    return Array.isArray(lessons) ? lessons : [];
  }

  function getProgress(course) {
    const totalLessons = getCourseLessonCount(course);

    if (!totalLessons) return 0;

    const completed = getCourseCompletedLessons(course).length;

    return Math.min(
      100,
      Math.round((completed / totalLessons) * 100)
    );
  }

  const totalLessons = useMemo(() => {
    return trackedCourses.reduce(
      (total, course) => total + getCourseLessonCount(course),
      0
    );
  }, [trackedCourses, completedLessons]);

  const totalCompletedLessons = useMemo(() => {
    return trackedCourses.reduce(
      (total, course) =>
        total + getCourseCompletedLessons(course).length,
      0
    );
  }, [trackedCourses, completedLessons]);

  /*
   * Progresso global ponderado pelo número real de aulas.
   *
   * Exemplo:
   * 10 aulas num curso + 10 aulas noutro curso.
   * 5 aulas concluídas = 25%.
   */
  const globalProgress = useMemo(() => {
    if (totalLessons === 0) return 0;

    return Math.min(
      100,
      Math.round(
        (totalCompletedLessons / totalLessons) * 100
      )
    );
  }, [totalLessons, totalCompletedLessons]);

  /*
   * ============================================================
   * SIMULAÇÕES
   * ============================================================
   *
   * Só contamos uma simulação quando o seu estado é realmente
   * "completed": true.
   */

  const simulationsCompleted = useMemo(() => {
    const results = user?.simulation_results;

    if (!results || typeof results !== "object") {
      return 0;
    }

    return Object.values(results).filter(
      (simulation) => simulation?.completed === true
    ).length;
  }, [user?.simulation_results]);

  /*
   * ============================================================
   * CERTIFICADOS
   * ============================================================
   */

  const certificates = certificateList.length;

/*
 * ============================================================
 * ESTADO EM CIBERSEGURANÇA
 * ============================================================
 *
 * O estado cresce progressivamente conforme o estudante:
 *
 * - conclui aulas;
 * - conclui cursos e respectivos testes;
 * - conclui simulações práticas.
 *
 * Peso:
 * 40% -> progresso das aulas
 * 30% -> cursos/testes concluídos
 * 30% -> simulações concluídas
 */

const totalAvailableCourses = courses.length;

const courseProgressScore =
  totalLessons > 0
    ? Math.min(
        100,
        Math.round(
          (totalCompletedLessons / totalLessons) * 100
        )
      )
    : 0;

const courseCompletionScore =
  totalAvailableCourses > 0
    ? Math.min(
        100,
        Math.round(
          (completedCourseCount / totalAvailableCourses) * 100
        )
      )
    : 0;

const totalSimulationsAvailable = 25;

const simulationScore =
  totalSimulationsAvailable > 0
    ? Math.min(
        100,
        Math.round(
          (simulationsCompleted / totalSimulationsAvailable) * 100
        )
      )
    : 0;

const cybersecurityState = Math.min(
  100,
  Math.round(
    courseProgressScore * 0.4 +
      courseCompletionScore * 0.3 +
      simulationScore * 0.3
  )
);

  /*
   * ============================================================
   * CURSO ACTUAL
   * ============================================================
   */

  const inProgressCourses = useMemo(() => {
  return trackedCourses.filter(
    (course) =>
      !completedCourseIds.includes(course.id) &&
      getProgress(course) < 100
  );
}, [trackedCourses, completedCourseIds, completedLessons]);
const currentCourse = useMemo(() => {
    if (trackedCourses.length === 0) {
      return null;
    }

    const unfinished = trackedCourses.find(
      (course) => getProgress(course) < 100
    );

    return unfinished || trackedCourses[0];
  }, [trackedCourses, completedLessons]);

  const currentCourseCompleted =
    currentCourse && getProgress(currentCourse) >= 100;

  /*
   * ============================================================
   * IDENTIDADE
   * ============================================================
   */

  const fullName = user?.name?.trim() || "Estudante";
  const recommendations = Array.isArray(user?.recommendations)
    ? user.recommendations
    : [];

  return (
    <div className="min-h-full bg-slate-50">
      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10 lg:py-9">

        {/* =========================================================
            CABEÇALHO
        ========================================================== */}

        <header className="mb-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Área do estudante
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Olá, {fullName}. <span aria-hidden="true">👋</span>
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              Continue a desenvolver as suas competências de segurança
              digital.
            </p>
          </div>

          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20 sm:flex">
            {fullName.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* =========================================================
            HERO
        ========================================================== */}

        <section className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 shadow-2xl shadow-blue-900/10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_330px] lg:p-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-blue-50 backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                O seu espaço de aprendizagem
              </div>

              <h2 className="mt-6 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Conhecimento é a primeira camada de defesa.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                Aprenda, pratique e desenvolva hábitos mais seguros para
                enfrentar os riscos do mundo digital.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/student/cursos"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-blue-700 shadow-xl shadow-blue-950/20 transition-all hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  Explorar cursos
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/student/simulacoes"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/15"
                >
                  Praticar simulações
                  <ShieldAlert className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* AVALIAÇÃO */}
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md lg:self-end">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-100">
                    Estado em Cibersegurança
                  </p>

                  <p className="mt-2 text-2xl font-bold text-white">
                    {cybersecurityState}%
                  </p>

                  <p className="mt-1 text-xs font-medium text-blue-100">
                    Progresso global de segurança
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                  <Target className="h-7 w-7 text-white" />
                </div>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{
                    width: `${cybersecurityState}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-blue-100">
                Este resultado ajuda a orientar o seu percurso de
                aprendizagem.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            ESTATÍSTICAS
        ========================================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={BookOpen}
            label="Cursos no percurso"
            value={trackedCourses.length}
            helper="Cursos acompanhados"
          />

          <StatCard
            icon={CirclePlay}
            label="Aulas concluídas"
            value={totalCompletedLessons}
            helper={`${totalLessons} aulas no percurso`}
          />

          <StatCard
            icon={ShieldAlert}
            label="Simulações concluídas"
            value={simulationsCompleted}
            helper="Experiências realizadas"
          />

          <StatCard
            icon={Award}
            label="Certificados"
            value={certificates}
            helper="Conquistas obtidas"
          />
        </section>

        {/* =========================================================
            PROGRESSO GLOBAL
        ========================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <TrendingUp className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                  Percurso de aprendizagem
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                  O seu progresso global
                </h2>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-3xl font-black text-slate-950">
                {globalProgress}%
              </p>

              <p className="mt-1 text-xs font-medium text-slate-400">
                progresso das aulas
              </p>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-700"
              style={{
                width: `${globalProgress}%`,
              }}
            />
          </div>

          <div className="mt-4 flex flex-col gap-2 text-xs font-medium text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {totalCompletedLessons} de {totalLessons} aulas concluídas
            </span>

            <span>
              {completedCourseCount} curso
              {completedCourseCount === 1 ? "" : "s"} concluído
              {completedCourseCount === 1 ? "" : "s"}
            </span>
          </div>
        </section>

        {/* =========================================================
            CURSOS CONCLUÍDOS
        ========================================================== */}
        {/* =========================================================
            CURSOS CONCLUÍDOS
        ========================================================== */}

        {completedCourseCount > 0 && (
          <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
            <div className="border-b border-slate-100 px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                    Conquistas
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    Cursos concluídos
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Consulte os cursos que completou e os respectivos certificados.
                  </p>
                </div>

                <div className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-700">
                  {completedCourseCount} concluído
                  {completedCourseCount === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5 sm:p-7">
              {trackedCourses
                .filter((course) => completedCourseIds.includes(course.id))
                .map((course) => {
                  const certificate = certificateList.find(
                    (item) => item.course_id === course.id
                  );

                  const selected =
                    selectedCertificate?.course_id === course.id;

                  return (
                    <div
                      key={course.id}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 transition-all duration-300 hover:border-blue-200 hover:bg-white hover:shadow-lg"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCertificate(
                            selected ? null : certificate || null
                          )
                        }
                        className="group flex w-full flex-col text-left sm:flex-row"
                      >
                        <div className="h-48 w-full shrink-0 overflow-hidden sm:h-40 sm:w-52">
                          <img
                            src={
                              courseImages[course.id] ||
                              "https://images.pexels.com/photos/1181251/pexels-photo-1181251.jpeg?auto=compress&cs=tinysrgb&w=800"
                            }
                            alt={course.title}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex min-w-0 flex-1 items-center justify-between gap-5 p-5 sm:p-6">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Curso concluído
                              </span>

                              {certificate && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">
                                  <Award className="h-3.5 w-3.5" />
                                  Certificado
                                </span>
                              )}
                            </div>

                            <h3 className="mt-3 text-lg font-bold leading-6 text-slate-950 sm:text-xl">
                              {course.title}
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                              {certificate
                                ? "Clique para visualizar o certificado."
                                : "Curso concluído com sucesso."}
                            </p>
                          </div>

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white">
                            <ChevronRight
                              className={`h-5 w-5 transition-transform duration-300 ${
                                selected ? "rotate-90" : ""
                              }`}
                            />
                          </div>
                        </div>
                      </button>

                      {/* =====================================================
                          CERTIFICADO
                      ====================================================== */}

                      {selected && certificate && (
                        <div className="border-t border-slate-200 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-5 sm:p-8">
                          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/40 sm:p-9">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-blue-700">
                                  <Award className="h-4 w-4" />
                                  Certificado SICSI III
                                </div>

                                <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                                  Certificamos que
                                </p>

                                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                                  {certificate.student_name || fullName}
                                </h3>

                                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                                  concluiu com sucesso o curso
                                </p>

                                <p className="mt-2 text-xl font-bold text-blue-700 sm:text-2xl">
                                  {certificate.course_title || course.title}
                                </p>
                              </div>

                              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                                <ShieldCheck className="h-10 w-10" />
                              </div>
                            </div>

                            <div className="mt-8 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-3">
                              <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Resultado
                                </p>

                                <p className="mt-1 text-lg font-black text-slate-900">
                                  {certificate.percentage ??
                                    certificate.score ??
                                    0}
                                  %
                                </p>
                              </div>

                              <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Código
                                </p>

                                <p className="mt-1 break-all text-sm font-bold text-slate-900">
                                  {certificate.certificate_code || "SICSI"}
                                </p>
                              </div>

                              <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Emissão
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-900">
                                  {certificate.issued_at
                                    ? new Date(
                                        certificate.issued_at
                                      ).toLocaleDateString("pt-PT")
                                    : "—"}
                                </p>
                              </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                              <Link
                                to="/student/certificados"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                              >
                                Ver todos os certificados
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}

                      {selected && !certificate && (
                        <div className="border-t border-slate-200 bg-amber-50 p-5">
                          <p className="text-sm font-semibold text-amber-800">
                            O curso está concluído, mas o certificado ainda não
                            foi encontrado.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* =========================================================
            CONTEÚDO PRINCIPAL
        ========================================================== */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

          {/* CURSO ACTUAL */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                  Aprendizagem
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  Continue a aprender
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Retome os cursos exactamente onde ficou.
                </p>
              </div>

              <Link
                to="/student/cursos"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition hover:text-blue-700"
              >
                Ver cursos
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="p-5 sm:p-6">
              {loading ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-16 animate-pulse rounded-xl bg-slate-200" />

                    <div className="flex-1">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                      <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                </div>
              ) : inProgressCourses.length > 0 ? (
                <div className="space-y-3">
                  {inProgressCourses.slice(0, 3).map((course) => {
                    const progress = getProgress(course);
                    const completed =
                      getCourseCompletedLessons(course).length;
                    const total =
                      getCourseLessonCount(course);

                    return (
                      <div
                        key={course.id}
                        className="group flex min-w-0 items-center gap-3 rounded-2xl bg-white p-3 transition-colors duration-200 hover:bg-slate-50/60 sm:gap-4 sm:p-4"
                      >
                        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-28">
                          <img
                            src={
                              courseImages[course.id] ||
                              "https://images.pexels.com/photos/1181251/pexels-photo-1181251.jpeg?auto=compress&cs=tinysrgb&w=800"
                            }
                            alt={course.title}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-bold text-slate-950 sm:text-base">
                              {course.title}
                            </p>

                            <span className="hidden shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 sm:inline-flex">
                              {progress}%
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-3">
                            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                style={{
                                  width: `${progress}%`,
                                }}
                              />
                            </div>

                            <span className="shrink-0 text-[11px] font-semibold text-slate-400">
                              {completed}/{total}
                            </span>
                          </div>
                        </div>

                        <Link
                          to={`/student/cursos/${course.id}`}
                          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-blue-600 transition hover:border-blue-200 hover:bg-blue-50 sm:px-4 sm:py-2.5 sm:text-sm"
                        >
                          <span className="hidden sm:inline">
                            Continuar
                          </span>

                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    );
                  })}

                  <div className="pt-2 text-center">
                    <Link
                      to="/student/cursos"
                      className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      Ver mais cursos
                      <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-100">
                    <BookOpen className="h-7 w-7" />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    Nenhum curso em progresso.
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Explore os cursos disponíveis e comece a desenvolver
                    os seus conhecimentos de segurança digital.
                  </p>

                  <Link
                    to="/student/cursos"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                  >
                    Explorar cursos
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </section>
          {/* COLUNA LATERAL */}

          <aside className="space-y-6">

            {/* RECOMENDAÇÕES */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40 sm:p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                    Personalizado
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    Recomendado para si
                  </h2>
                </div>
              </div>

              {recommendations.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {recommendations
                    .slice(0, 4)
                    .map((recommendation, index) => (
                      <div
                        key={`${recommendation}-${index}`}
                        className="group flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-blue-100 hover:bg-blue-50/50"
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                          <Check className="h-4 w-4" />
                        </div>

                        <p className="text-sm font-semibold leading-5 text-slate-700">
                          {recommendation}
                        </p>
                      </div>
                    ))}
                </div>


              ) : (
                <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-700">
                    As suas recomendações aparecerão aqui.
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Complete a autoavaliação inicial para receber um percurso
                    de aprendizagem adaptado às suas necessidades.
                  </p>

                  {!user?.initial_assessment_completed && (
                    <Link
                      to="/student/autoavaliacao"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
                    >
                      Fazer autoavaliação
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              )}
            </section>

            {/* ACÇÕES RÁPIDAS */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                Acesso rápido
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Continue a evoluir
              </h2>

              <div className="mt-5 space-y-3">
                <QuickAction
                  to="/student/simulacoes"
                  icon={ShieldAlert}
                  title="Praticar simulações"
                  description="Aprenda através de situações realistas."
                />

                <QuickAction
                  to="/student/certificados"
                  icon={Award}
                  title="Os meus certificados"
                  description="Consulte as suas conquistas."
                />

                <QuickAction
                  to="/student/cursos"
                  icon={BookOpen}
                  title="Explorar cursos"
                  description="Descubra novos conteúdos."
                />
              </div>
            </section>
          </aside>
        </div>

        {/* =========================================================
            MOTIVAÇÃO FINAL
        ========================================================== */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-sky-50 p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Segurança digital constrói-se com prática.
                </p>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                  Cada aula concluída e cada simulação realizada aproxima-o
                  de decisões mais seguras no mundo digital.
                </p>
              </div>
            </div>

            <Link
              to="/student/simulacoes"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              Praticar agora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/30 transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/60">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>

        <span className="text-3xl font-black tracking-tight text-slate-950">
          {value}
        </span>
      </div>

      <p className="mt-5 text-sm font-bold text-slate-800">
        {label}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-400">
        {helper}
      </p>
    </article>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  description,
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-blue-100 hover:bg-blue-50/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-100 transition-all group-hover:bg-blue-600 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-xs leading-5 text-slate-400">
          {description}
        </p>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
    </Link>
  );
}
