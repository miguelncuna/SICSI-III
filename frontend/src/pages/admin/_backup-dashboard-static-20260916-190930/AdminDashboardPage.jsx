import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  Award,
  UserCog,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000/api";

async function api(url) {
  const response = await fetch(`${API}${url}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Não foi possível carregar os dados."
    );
  }

  return data;
}

function KpiCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-400">
            {helper}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function load(showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }

    setError("");

    try {
      const [statsData, courseData, certificateData] =
        await Promise.all([
          api("/admin/stats"),
          api("/admin/courses"),
          api("/certificates"),
        ]);

      setStats(statsData || {});
      setCourses(Array.isArray(courseData) ? courseData : []);
      setCertificates(
        Array.isArray(certificateData)
          ? certificateData
          : []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function refresh() {
    setRefreshing(true);
    await load(false);
  }

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-64px)] p-5 sm:p-8">
        <div className="mx-auto max-w-[1500px] animate-pulse">
          <div className="h-10 w-72 rounded-xl bg-slate-200" />
          <div className="mt-3 h-5 w-[480px] max-w-full rounded-lg bg-slate-200" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-36 rounded-[24px] bg-slate-200"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const recentCourses = courses.slice(-5).reverse();
  const recentCertificates = certificates.slice(-5).reverse();

  return (
    <main className="min-h-[calc(100vh-64px)] p-5 sm:p-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Visão geral
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Acompanhe os principais indicadores e faça a gestão diária da
              plataforma.
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Actualizar
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={Users}
            label="Utilizadores"
            value={stats?.users ?? "—"}
            helper="Contas registadas"
          />

          <KpiCard
            icon={BookOpen}
            label="Cursos"
            value={stats?.courses ?? courses.length}
            helper="Cursos da plataforma"
          />

          <KpiCard
            icon={Award}
            label="Certificados"
            value={stats?.certificates ?? certificates.length}
            helper="Certificações emitidas"
          />

          <KpiCard
            icon={UserCog}
            label="Administradores"
            value={stats?.admins ?? "—"}
            helper="Funções administrativas"
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                  Plataforma
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Cursos recentes
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ShieldCheck size={20} />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {recentCourses.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                  Ainda não existem cursos registados.
                </div>
              ) : (
                recentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">
                        {course.title}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        {course.lessons_count ?? course.lessons?.length ?? 0} aulas
                        {" · "}
                        {course.questions_count ??
                          course.questions?.length ??
                          0} perguntas
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/admin/cursos")}
                      className="inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700"
                    >
                      Gerir
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[28px] bg-[#071a33] p-6 text-white shadow-sm">
            <p className="text-xs font-black uppercase tracking-wider text-blue-300">
              Administração
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Gestão rápida
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Entre directamente nas áreas de gestão.
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => navigate("/admin/cursos")}
                className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-4 text-left hover:bg-white/15"
              >
                <span>
                  <span className="block text-sm font-black">
                    Gerir cursos
                  </span>

                  <span className="mt-1 block text-xs text-slate-300">
                    Criar, editar e organizar formações
                  </span>
                </span>

                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/utilizadores")}
                className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-4 text-left hover:bg-white/15"
              >
                <span>
                  <span className="block text-sm font-black">
                    Gerir utilizadores
                  </span>

                  <span className="mt-1 block text-xs text-slate-300">
                    Consultar contas e funções
                  </span>
                </span>

                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/certificados")}
                className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-4 text-left hover:bg-white/15"
              >
                <span>
                  <span className="block text-sm font-black">
                    Ver certificados
                  </span>

                  <span className="mt-1 block text-xs text-slate-300">
                    Consultar e descarregar
                  </span>
                </span>

                <ArrowRight size={17} />
              </button>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                Emissões
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Certificados recentes
              </h2>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/certificados")}
              className="text-xs font-black text-blue-600 hover:text-blue-700"
            >
              Ver todos
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentCertificates.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                Ainda não existem certificados.
              </div>
            ) : (
              recentCertificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="rounded-2xl border border-slate-100 p-4"
                >
                  <p className="truncate text-sm font-black text-slate-900">
                    {certificate.student_name || "Estudante"}
                  </p>

                  <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                    {certificate.course_title || "Curso"}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
