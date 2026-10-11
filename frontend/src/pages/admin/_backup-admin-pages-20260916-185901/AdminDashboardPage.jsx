
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Award,
  BookOpen,
  Check,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Edit3,
  Eye,
  ExternalLink,
  FileQuestion,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  Video,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API = "http://127.0.0.1:8000/api";

const NAVIGATION = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "courses", label: "Cursos", icon: BookOpen },
  { id: "users", label: "Utilizadores", icon: Users },
  { id: "certificates", label: "Certificados", icon: Award },
];

async function api(url, options = {}) {
  const response = await fetch(`${API}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        "Não foi possível concluir a operação."
    );
  }

  return data;
}

function getInitials(name) {
  if (!name) return "AD";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

function normalizeYouTubeUrl(url) {
  if (!url) return "";

  try {
    const parsed = new URL(url);

    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("youtube-nocookie.com")
    ) {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }
    }

    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    return url;
  } catch {
    return url;
  }
}

function optionText(option) {
  return typeof option === "string" ? option : option?.text || "";
}

function toastTone(type) {
  return type === "error"
    ? {
        wrapper:
          "border-red-200 bg-white text-red-950 shadow-red-100/70",
        icon: "bg-red-50 text-red-600",
        title: "Operação não concluída",
        Icon: CircleAlert,
      }
    : {
        wrapper:
          "border-emerald-200 bg-white text-emerald-950 shadow-emerald-100/70",
        icon: "bg-emerald-50 text-emerald-600",
        title: "Operação concluída",
        Icon: CircleCheck,
      };
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();

  const [section, setSection] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const [courseSearch, setCourseSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [certificateSearch, setCertificateSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const [modal, setModal] = useState(null);

  function notify(message, type = "success") {
    setToast({ open: true, message, type });
  }

  useEffect(() => {
    if (!toast.open) return undefined;
    const timer = window.setTimeout(
      () => setToast((current) => ({ ...current, open: false })),
      toast.type === "error" ? 6500 : 4200
    );
    return () => window.clearTimeout(timer);
  }, [toast.open, toast.type]);

  async function load(showLoading = true) {
    if (showLoading) setLoading(true);

    try {
      const [statsData, courseData, userData, certificateData] =
        await Promise.all([
          api("/admin/stats"),
          api("/admin/courses"),
          api("/users"),
          api("/certificates"),
        ]);

      setStats(statsData || {});
      setCourses(Array.isArray(courseData) ? courseData : []);
      setUsers(Array.isArray(userData) ? userData : []);
      setCertificates(
        Array.isArray(certificateData) ? certificateData : []
      );
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function refreshAll() {
    setRefreshing(true);
    await load(false);
    notify("Dados actualizados com sucesso.");
  }

  function navigateTo(id) {
    setSection(id);
    setMobileOpen(false);
    setModal(null);
  }

  async function createCourse(payload) {
    try {
      await api("/admin/courses", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await load(false);
      setModal(null);
      notify("Curso criado com sucesso.");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function updateCourse(id, payload) {
    try {
      await api(`/admin/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      await load(false);
      setModal(null);
      notify("Curso actualizado com sucesso.");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function deleteCourse(course) {
    const ok = window.confirm(
      `Eliminar o curso "${course.title}"?\n\nEsta operação remove o curso da plataforma.`
    );
    if (!ok) return;

    try {
      await api(`/admin/courses/${course.id}`, { method: "DELETE" });
      await load(false);
      notify("Curso eliminado com sucesso.");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function createLesson(courseId, payload) {
    try {
      await api(`/admin/courses/${courseId}/lessons`, {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          video_url: normalizeYouTubeUrl(payload.video_url),
        }),
      });
      await load(false);
      notify("Aula adicionada com sucesso.");
      setModal((current) =>
        current?.type === "lessons"
          ? { ...current, refreshToken: Date.now() }
          : current
      );
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function updateLesson(courseId, lessonId, payload) {
    try {
      await api(`/admin/courses/${courseId}/lessons/${lessonId}`, {
        method: "PUT",
        body: JSON.stringify({
          ...payload,
          video_url: normalizeYouTubeUrl(payload.video_url),
        }),
      });
      await load(false);
      notify("Aula actualizada com sucesso.");
      setModal((current) =>
        current?.type === "lessons"
          ? { ...current, refreshToken: Date.now() }
          : current
      );
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function deleteLesson(courseId, lessonId) {
    if (!window.confirm("Eliminar esta aula?")) return;

    try {
      await api(`/admin/courses/${courseId}/lessons/${lessonId}`, {
        method: "DELETE",
      });
      await load(false);
      notify("Aula eliminada com sucesso.");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function createQuestion(courseId, payload) {
    try {
      await api(`/admin/courses/${courseId}/questions`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await load(false);
      notify("Pergunta adicionada com sucesso.");
      setModal((current) =>
        current?.type === "questions"
          ? { ...current, refreshToken: Date.now() }
          : current
      );
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function updateQuestion(courseId, questionId, payload) {
    try {
      await api(`/admin/courses/${courseId}/questions/${questionId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      await load(false);
      notify("Pergunta actualizada com sucesso.");
      setModal((current) =>
        current?.type === "questions"
          ? { ...current, refreshToken: Date.now() }
          : current
      );
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function deleteQuestion(courseId, questionId) {
    if (!window.confirm("Eliminar esta pergunta?")) return;

    try {
      await api(
        `/admin/courses/${courseId}/questions/${questionId}`,
        { method: "DELETE" }
      );
      await load(false);
      notify("Pergunta eliminada com sucesso.");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function createUser(payload) {
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await load(false);
      setModal(null);
      notify("Utilizador criado com sucesso.");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function toggleUserRole(userItem) {
    const nextRole = userItem.role === "admin" ? "student" : "admin";
    const label = nextRole === "admin" ? "promover" : "retirar a função de administrador de";

    if (
      !window.confirm(
        `Deseja ${label} "${userItem.name}"?`
      )
    ) {
      return;
    }

    try {
      await api(`/users/${userItem.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: nextRole }),
      });
      await load(false);
      notify(
        nextRole === "admin"
          ? "Utilizador promovido a administrador."
          : "Função de administrador removida."
      );
    } catch (error) {
      notify(error.message, "error");
    }
  }

  const filteredCourses = useMemo(() => {
    const term = courseSearch.trim().toLowerCase();
    if (!term) return courses;

    return courses.filter((course) =>
      [course.title, course.description]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(term)
        )
    );
  }, [courses, courseSearch]);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();

    return users.filter((item) => {
      const matchesSearch =
        !term ||
        [item.name, item.email, item.role]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(term)
          );

      const matchesRole =
        userRoleFilter === "all" ||
        item.role === userRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, userRoleFilter]);

  const filteredCertificates = useMemo(() => {
    const term = certificateSearch.trim().toLowerCase();
    if (!term) return certificates;

    return certificates.filter((certificate) =>
      [
        certificate.student_name,
        certificate.student_email,
        certificate.course_title,
        certificate.certificate_code,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(term)
        )
    );
  }, [certificates, certificateSearch]);

  const adminName = user?.name?.trim() || "Administrador";
  const initials = getInitials(adminName);

  const openCertificate = (certificate) => {
    window.open(
      `${API}/certificates/${certificate.id}/pdf`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const downloadCertificate = (certificate) => {
    const link = document.createElement("a");
    link.href = `${API}/certificates/${certificate.id}/pdf`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <AdminSidebar
        active={section}
        onNavigate={navigateTo}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        initials={initials}
        name={adminName}
        role={user?.role}
        onLogout={logout}
      />

      <div className="min-h-screen xl:ml-72">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl xl:px-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 xl:hidden"
                aria-label="Abrir menu"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  SICSI III · Administração
                </p>
                <h1 className="mt-0.5 text-lg font-black tracking-tight text-slate-950">
                  {section === "dashboard"
                    ? "Painel de controlo"
                    : section === "courses"
                    ? "Gestão de cursos"
                    : section === "users"
                    ? "Gestão de utilizadores"
                    : "Gestão de certificados"}
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={refreshAll}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 xl:px-8">
          {loading ? (
            <AdminLoading />
          ) : section === "dashboard" ? (
            <DashboardSection
              stats={stats}
              courses={courses}
              users={users}
              certificates={certificates}
              adminName={adminName}
              onNavigate={navigateTo}
              onCreateCourse={() => setModal({ type: "course-create" })}
            />
          ) : section === "courses" ? (
            <CoursesSection
              courses={filteredCourses}
              search={courseSearch}
              setSearch={setCourseSearch}
              onCreate={() => setModal({ type: "course-create" })}
              onEdit={(course) =>
                setModal({ type: "course-edit", course })
              }
              onLessons={(course) =>
                setModal({ type: "lessons", course })
              }
              onQuestions={(course) =>
                setModal({ type: "questions", course })
              }
              onDelete={deleteCourse}
              onTogglePublished={updateCourse}
            />
          ) : section === "users" ? (
            <UsersSection
              users={filteredUsers}
              search={userSearch}
              setSearch={setUserSearch}
              roleFilter={userRoleFilter}
              setRoleFilter={setUserRoleFilter}
              onCreate={() => setModal({ type: "user-create" })}
              onToggleRole={toggleUserRole}
            />
          ) : (
            <CertificatesSection
              certificates={filteredCertificates}
              search={certificateSearch}
              setSearch={setCertificateSearch}
              onView={openCertificate}
              onDownload={downloadCertificate}
            />
          )}
        </main>
      </div>

      {toast.open && (
        <AdminToast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast((current) => ({ ...current, open: false }))}
        />
      )}

      {modal?.type === "course-create" && (
        <CourseFormModal
          mode="create"
          onClose={() => setModal(null)}
          onSave={createCourse}
        />
      )}

      {modal?.type === "course-edit" && (
        <CourseFormModal
          mode="edit"
          course={modal.course}
          onClose={() => setModal(null)}
          onSave={(payload) => updateCourse(modal.course.id, payload)}
        />
      )}

      {modal?.type === "lessons" && (
        <LessonsModal
          key={`${modal.course.id}-${modal.refreshToken || 0}`}
          course={
            courses.find((item) => item.id === modal.course.id) ||
            modal.course
          }
          onClose={() => setModal(null)}
          onCreate={createLesson}
          onUpdate={updateLesson}
          onDelete={deleteLesson}
        />
      )}

      {modal?.type === "questions" && (
        <QuestionsModal
          key={`${modal.course.id}-${modal.refreshToken || 0}`}
          course={
            courses.find((item) => item.id === modal.course.id) ||
            modal.course
          }
          onClose={() => setModal(null)}
          onCreate={createQuestion}
          onUpdate={updateQuestion}
          onDelete={deleteQuestion}
        />
      )}

      {modal?.type === "user-create" && (
        <UserCreateModal
          onClose={() => setModal(null)}
          onSave={createUser}
        />
      )}
    </div>
  );
}

/* ============================================================
   SIDEBAR
============================================================ */

function AdminSidebar({
  active,
  onNavigate,
  mobileOpen,
  onClose,
  initials,
  name,
  role,
  onLogout,
}) {
  const content = (
    <aside className="flex h-full w-72 flex-col bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
          <ShieldCheck size={22} />
        </div>
        <div>
          <p className="font-black tracking-tight text-slate-950">
            SICSI <span className="text-blue-600">III</span>
          </p>
          <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Área administrativa
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-5">
        <p className="px-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
          Navegação
        </p>

        <nav className="mt-3 space-y-1.5">
          {NAVIGATION.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-blue-600"
                  }`}
                >
                  <Icon size={18} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <Activity size={17} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-700">
                Plataforma
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Gestão central do conteúdo, utilizadores e certificações.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-900">
              {name}
            </p>
            <p className="text-xs font-semibold text-slate-400">
              {role === "admin" ? "Administrador" : "Utilizador"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">
            <LogOut size={17} />
          </span>
          Terminar sessão
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r border-slate-200 bg-white xl:block">
        {content}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[90] xl:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />
          <div className="relative h-full w-72 border-r border-slate-200 shadow-2xl">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   DASHBOARD
============================================================ */

function DashboardSection({
  stats,
  courses,
  users,
  certificates,
  adminName,
  onNavigate,
  onCreateCourse,
}) {
  const published = courses.filter((course) => course.published !== false).length;
  const students = users.filter((item) => item.role === "student").length;
  const admins = users.filter((item) => item.role === "admin").length;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.3fr_.7fr]">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 p-7 text-white sm:p-9">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-sky-300/10 blur-3xl" />

            <div className="relative max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-blue-100">
                <ShieldCheck size={14} />
                Centro de controlo SICSI III
              </span>

              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Olá, {adminName.split(" ")[0]}.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
                Acompanhe a plataforma, organize a aprendizagem e mantenha
                todos os recursos administrativos num único espaço.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onNavigate.bind(null, "courses")}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-blue-800 transition hover:bg-blue-50"
                >
                  <BookOpen size={17} />
                  Gerir cursos
                </button>

                <button
                  type="button"
                  onClick={onCreateCourse}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
                >
                  <Plus size={17} />
                  Novo curso
                </button>
              </div>
            </div>
          </div>

          <div className="relative min-h-[250px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85"
              alt="Equipa a trabalhar em colaboração"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-blue-950/20 via-blue-950/20 to-blue-950/75" />

            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-slate-950/55 p-4 text-white backdrop-blur-md">
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-200">
                Administração
              </p>
              <p className="mt-1 text-sm font-semibold leading-6">
                Conteúdo consistente cria aprendizagem consistente.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Utilizadores"
          value={stats?.users ?? users.length}
          tone="blue"
          hint={`${students} estudantes`}
        />
        <MetricCard
          icon={BookOpen}
          label="Cursos"
          value={stats?.courses ?? courses.length}
          tone="indigo"
          hint={`${published} publicados`}
        />
        <MetricCard
          icon={Award}
          label="Certificados"
          value={stats?.certificates ?? certificates.length}
          tone="emerald"
          hint="Emissão da plataforma"
        />
        <MetricCard
          icon={UserCog}
          label="Administradores"
          value={stats?.admins ?? admins}
          tone="violet"
          hint="Contas com acesso administrativo"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                  Atalhos
                </p>
                <h3 className="mt-1 text-xl font-black tracking-tight">
                  Gestão rápida
                </h3>
              </div>
              <Activity className="text-slate-300" size={22} />
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2">
            <QuickAction
              icon={BookOpen}
              title="Cursos"
              text="Criar, editar, publicar e organizar aulas."
              onClick={() => onNavigate("courses")}
            />
            <QuickAction
              icon={Users}
              title="Utilizadores"
              text="Consultar contas e gerir funções."
              onClick={() => onNavigate("users")}
            />
            <QuickAction
              icon={Award}
              title="Certificados"
              text="Visualizar e baixar certificados emitidos."
              onClick={() => onNavigate("certificates")}
            />
            <QuickAction
              icon={ClipboardList}
              title="Conteúdo"
              text="Aulas e avaliações ligadas aos cursos."
              onClick={() => onNavigate("courses")}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-600">
              Estado
            </p>
            <h3 className="mt-1 text-xl font-black tracking-tight">
              Plataforma
            </h3>
          </div>

          <div className="space-y-3 p-5">
            <StatusLine label="API administrativa" status="Operacional" />
            <StatusLine label="Cursos publicados" status={`${published}`} />
            <StatusLine label="Utilizadores" status={`${users.length}`} />
            <StatusLine
              label="Certificados emitidos"
              status={`${certificates.length}`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, hint, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}
        >
          <Icon size={20} />
        </div>
        <span className="text-xs font-bold text-slate-400">SICSI III</span>
      </div>
      <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold text-slate-400">{hint}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, title, text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        <Icon size={18} />
      </span>
      <p className="mt-4 text-sm font-black text-slate-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </button>
  );
}

function StatusLine({ label, status }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30" />
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
      <span className="text-xs font-black text-slate-400">{status}</span>
    </div>
  );
}

/* ============================================================
   COURSES
============================================================ */

function CoursesSection({
  courses,
  search,
  setSearch,
  onCreate,
  onEdit,
  onLessons,
  onQuestions,
  onDelete,
  onTogglePublished,
}) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            Administração
          </p>
          <h2 className="mt-1 text-3xl font-black tracking-tight">
            Cursos
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Faça a gestão directamente nesta lista: criar, editar, publicar,
            organizar aulas, gerir perguntas e eliminar.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={17} />
          Novo curso
        </button>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar curso por nome ou descrição..."
          />
        </div>

        {courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhum curso encontrado"
            text="Crie um novo curso ou ajuste a pesquisa."
            actionLabel="Criar curso"
            onAction={onCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-5 py-4">Curso</th>
                  <th className="px-5 py-4">Conteúdo</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Actualizado</th>
                  <th className="px-5 py-4 text-right">Acções</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                          <BookOpen size={18} />
                        </div>
                        <div className="min-w-0 max-w-[380px]">
                          <p className="truncate text-sm font-black text-slate-950">
                            {course.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {course.description || "Sem descrição."}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
                          <Video size={13} />
                          {course.lessons_count ?? course.lessons?.length ?? 0} aulas
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
                          <FileQuestion size={13} />
                          {course.questions_count ?? course.questions?.length ?? 0} perguntas
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${
                          course.published !== false
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            course.published !== false
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />
                        {course.published !== false
                          ? "Publicado"
                          : "Rascunho"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                      {formatDate(course.updated_at || course.created_at)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <ActionButton
                          icon={Edit3}
                          label="Editar"
                          onClick={() => onEdit(course)}
                        />
                        <ActionButton
                          icon={Video}
                          label="Aulas"
                          onClick={() => onLessons(course)}
                        />
                        <ActionButton
                          icon={FileQuestion}
                          label="Perguntas"
                          onClick={() => onQuestions(course)}
                        />
                        <ActionButton
                          icon={
                            course.published !== false ? Eye : Check
                          }
                          label={
                            course.published !== false
                              ? "Publicar"
                              : "Publicar"
                          }
                          tone="blue"
                          onClick={() =>
                            onTogglePublished(course.id, {
                              title: course.title,
                              description: course.description || "",
                              published: course.published === false,
                            })
                          }
                        />
                        <ActionButton
                          icon={Trash2}
                          label="Eliminar"
                          tone="danger"
                          onClick={() => onDelete(course)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   USERS
============================================================ */

function UsersSection({
  users,
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  onCreate,
  onToggleRole,
}) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            Administração
          </p>
          <h2 className="mt-1 text-3xl font-black tracking-tight">
            Utilizadores
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Lista central de contas com pesquisa, filtro e gestão da função
            administrativa.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={17} />
          Novo utilizador
        </button>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="flex-1">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Pesquisar por nome, email ou função..."
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="all">Todas as funções</option>
            <option value="student">Estudantes</option>
            <option value="admin">Administradores</option>
          </select>
        </div>

        <div className="border-b border-amber-100 bg-amber-50/60 px-5 py-3 text-xs leading-5 text-amber-900">
          <strong>Nota:</strong> a API actual permite consultar utilizadores,
          criar contas através do registo e alterar a função student/admin.
          Não existe actualmente um endpoint administrativo de eliminação ou
          edição de nome/email; por isso a interface não inventa operações
          que o backend não suporta.
        </div>

        {users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum utilizador encontrado"
            text="Não existem contas correspondentes aos filtros."
            actionLabel="Criar utilizador"
            onAction={onCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[950px] w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-5 py-4">Utilizador</th>
                  <th className="px-5 py-4">Função</th>
                  <th className="px-5 py-4">Criado em</th>
                  <th className="px-5 py-4 text-right">Acções</th>
                </tr>
              </thead>

              <tbody>
                {users.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-black text-blue-700">
                          {getInitials(item.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950">
                            {item.name || "Sem nome"}
                          </p>
                          <p className="truncate text-xs font-semibold text-slate-500">
                            {item.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${
                          item.role === "admin"
                            ? "bg-violet-50 text-violet-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {item.role === "admin"
                          ? "Administrador"
                          : "Estudante"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                      {formatDate(item.created_at)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <ActionButton
                          icon={UserCog}
                          label={
                            item.role === "admin"
                              ? "Remover admin"
                              : "Promover admin"
                          }
                          tone={
                            item.role === "admin" ? "danger" : "blue"
                          }
                          onClick={() => onToggleRole(item)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   CERTIFICATES
============================================================ */

function CertificatesSection({
  certificates,
  search,
  setSearch,
  onView,
  onDownload,
}) {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
          Administração
        </p>
        <h2 className="mt-1 text-3xl font-black tracking-tight">
          Certificados
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Consulte os certificados emitidos pelo SICSI III e abra ou baixe o
          documento PDF.
        </p>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar por aluno, curso ou código..."
          />
        </div>

        {certificates.length === 0 ? (
          <EmptyState
            icon={Award}
            title="Nenhum certificado encontrado"
            text="Os certificados aparecerão aqui assim que forem emitidos."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-5 py-4">Certificado</th>
                  <th className="px-5 py-4">Aluno</th>
                  <th className="px-5 py-4">Data</th>
                  <th className="px-5 py-4">Aproveitamento</th>
                  <th className="px-5 py-4 text-right">Acções</th>
                </tr>
              </thead>

              <tbody>
                {certificates.map((certificate) => (
                  <tr
                    key={certificate.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                          <Award size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[360px] truncate text-sm font-black text-slate-950">
                            {certificate.course_title || "Certificação SICSI III"}
                          </p>
                          <p className="mt-1 truncate font-mono text-[11px] font-semibold text-slate-400">
                            {certificate.certificate_code ||
                              certificate.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-black text-slate-900">
                        {certificate.student_name || "—"}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {certificate.student_email || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                      {formatDate(
                        certificate.issued_at ||
                          certificate.created_at
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                        {certificate.percentage ??
                          certificate.score ??
                          0}
                        %
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <ActionButton
                          icon={Eye}
                          label="Ver"
                          tone="blue"
                          onClick={() => onView(certificate)}
                        />
                        <ActionButton
                          icon={ExternalLink}
                          label="Baixar"
                          tone="emerald"
                          onClick={() => onDownload(certificate)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   MODALS
============================================================ */

function ModalShell({ title, subtitle, children, onClose, width = "max-w-2xl" }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div
        className={`flex max-h-[92vh] w-full ${width} flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-600">
              SICSI III
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
          {children}
        </div>
      </div>
    </div>
  );
}

function CourseFormModal({ mode, course, onClose, onSave }) {
  const [title, setTitle] = useState(course?.title || "");
  const [description, setDescription] = useState(
    course?.description || ""
  );
  const [published, setPublished] = useState(
    course?.published !== false
  );
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();

    if (!title.trim()) return;

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        published,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title={mode === "create" ? "Novo curso" : "Editar curso"}
      subtitle="Campos que a API e o dashboard do estudante realmente utilizam."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-5">
        <Field
          label="Título do curso"
          value={title}
          onChange={setTitle}
          placeholder="Ex.: Segurança Digital"
          required
        />

        <TextAreaField
          label="Descrição"
          value={description}
          onChange={setDescription}
          placeholder="Descreva brevemente o conteúdo e objectivo do curso."
          rows={5}
        />

        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
          />
          <span>
            <span className="block text-sm font-black text-slate-900">
              Curso publicado
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Apenas cursos publicados aparecem na área de cursos do estudante.
            </span>
          </span>
        </label>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onClose}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton type="submit" loading={saving}>
            {mode === "create" ? "Criar curso" : "Guardar alterações"}
          </PrimaryButton>
        </div>
      </form>
    </ModalShell>
  );
}

function LessonsModal({
  course,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const lessons = Array.isArray(course.lessons) ? course.lessons : [];

  function reset() {
    setEditingId(null);
    setTitle("");
    setVideoUrl("");
  }

  function startEdit(lesson) {
    setEditingId(lesson.id);
    setTitle(lesson.title || "");
    setVideoUrl(lesson.video_url || "");
  }

  async function submit(event) {
    event.preventDefault();

    if (!title.trim() || !videoUrl.trim()) return;

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        video_url: normalizeYouTubeUrl(videoUrl.trim()),
      };

      if (editingId) {
        await onUpdate(course.id, editingId, payload);
      } else {
        await onCreate(course.id, payload);
      }

      reset();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title={`Aulas · ${course.title}`}
      subtitle="Cada aula aceita título e URL de vídeo. O estudante recebe as aulas em sequência."
      onClose={onClose}
      width="max-w-5xl"
    >
      <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <form
          onSubmit={submit}
          className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5"
        >
          <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">
            {editingId ? "Editar aula" : "Nova aula"}
          </p>

          <div className="mt-4 space-y-4">
            <Field
              label="Título da aula"
              value={title}
              onChange={setTitle}
              placeholder="Ex.: O que é Segurança Digital?"
              required
            />

            <Field
              label="Link do vídeo"
              value={videoUrl}
              onChange={setVideoUrl}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />

            <p className="text-xs leading-5 text-slate-500">
              Links YouTube normais e links <code>/embed/</code> são
              normalizados automaticamente para o formato usado pelo leitor
              de cursos.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <PrimaryButton type="submit" loading={saving}>
              {editingId ? "Guardar aula" : "Adicionar aula"}
            </PrimaryButton>
            {editingId && (
              <SecondaryButton type="button" onClick={reset}>
                Cancelar edição
              </SecondaryButton>
            )}
          </div>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-slate-950">
                Conteúdo do curso
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                {lessons.length} {lessons.length === 1 ? "aula" : "aulas"}
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
              Ordem automática
            </span>
          </div>

          {lessons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <Video className="mx-auto text-slate-300" size={30} />
              <p className="mt-3 text-sm font-black text-slate-800">
                Ainda não existem aulas.
              </p>
            </div>
          ) : (
            lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-black text-blue-700">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900">
                        {lesson.title}
                      </p>
                      <p className="mt-1 truncate text-xs font-medium text-slate-400">
                        {lesson.video_url}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <ActionButton
                      icon={ExternalLink}
                      label="Abrir"
                      tone="blue"
                      onClick={() =>
                        window.open(
                          normalizeYouTubeUrl(lesson.video_url),
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                    />
                    <ActionButton
                      icon={Edit3}
                      label="Editar"
                      onClick={() => startEdit(lesson)}
                    />
                    <ActionButton
                      icon={Trash2}
                      label="Eliminar"
                      tone="danger"
                      onClick={() =>
                        onDelete(course.id, lesson.id)
                      }
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ModalShell>
  );
}

function QuestionsModal({
  course,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [editingId, setEditingId] = useState(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [saving, setSaving] = useState(false);

  const questions = Array.isArray(course.questions)
    ? course.questions
    : [];

  function reset() {
    setEditingId(null);
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
    setExplanation("");
  }

  function startEdit(item) {
    const raw = Array.isArray(item.options) ? item.options : [];
    const normalized = raw.map(optionText);

    while (normalized.length < 4) {
      normalized.push("");
    }

    const index =
      typeof item.correct_answer === "number"
        ? item.correct_answer
        : Math.max(
            0,
            normalized.findIndex(
              (value, optionIndex) =>
                String(item.correct_answer) ===
                String(String.fromCharCode(97 + optionIndex))
            )
          );

    setEditingId(item.id);
    setQuestion(item.question || "");
    setOptions(normalized.slice(0, 6));
    setCorrectAnswer(index);
    setExplanation(item.explanation || "");
  }

  function addOption() {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  }

  function removeOption(index) {
    if (options.length <= 2) return;

    const next = options.filter((_, itemIndex) => itemIndex !== index);
    let nextCorrect = correctAnswer;

    if (index === correctAnswer) {
      nextCorrect = 0;
    } else if (index < correctAnswer) {
      nextCorrect -= 1;
    }

    setOptions(next);
    setCorrectAnswer(Math.max(0, nextCorrect));
  }

  async function submit(event) {
    event.preventDefault();

    const cleanOptions = options
      .map((item) => item.trim())
      .filter(Boolean);

    if (!question.trim() || cleanOptions.length < 2) return;
    if (correctAnswer >= cleanOptions.length) return;

    setSaving(true);
    try {
      const payload = {
        question: question.trim(),
        options: cleanOptions,
        correct_answer: Number(correctAnswer),
        explanation: explanation.trim(),
      };

      if (editingId) {
        await onUpdate(course.id, editingId, payload);
      } else {
        await onCreate(course.id, payload);
      }

      reset();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title={`Avaliação · ${course.title}`}
      subtitle="Crie e mantenha as perguntas que serão utilizadas no teste final do curso."
      onClose={onClose}
      width="max-w-6xl"
    >
      <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <form
          onSubmit={submit}
          className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5"
        >
          <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">
            {editingId ? "Editar pergunta" : "Nova pergunta"}
          </p>

          <div className="mt-4 space-y-4">
            <TextAreaField
              label="Pergunta"
              value={question}
              onChange={setQuestion}
              placeholder="Escreva a pergunta..."
              rows={4}
            />

            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-black text-slate-800">
                  Opções
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  disabled={options.length >= 6}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-black text-blue-700 transition hover:bg-blue-50 disabled:opacity-40"
                >
                  <Plus size={14} />
                  Adicionar
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {options.map((value, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCorrectAnswer(index)}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                        correctAnswer === index
                          ? "bg-emerald-600 text-white"
                          : "bg-white text-slate-500"
                      }`}
                      title="Definir como resposta correcta"
                    >
                      {String.fromCharCode(65 + index)}
                    </button>

                    <input
                      value={value}
                      onChange={(event) => {
                        const next = [...options];
                        next[index] = event.target.value;
                        setOptions(next);
                      }}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-blue-400"
                      placeholder={`Opção ${String.fromCharCode(
                        65 + index
                      )}`}
                    />

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label="Remover opção"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-2 text-[11px] font-semibold text-slate-400">
                A opção verde é a resposta correcta.
              </p>
            </div>

            <TextAreaField
              label="Explicação"
              value={explanation}
              onChange={setExplanation}
              placeholder="Explique por que a resposta correcta é segura."
              rows={4}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <PrimaryButton type="submit" loading={saving}>
              {editingId ? "Guardar pergunta" : "Adicionar pergunta"}
            </PrimaryButton>
            {editingId && (
              <SecondaryButton type="button" onClick={reset}>
                Cancelar edição
              </SecondaryButton>
            )}
          </div>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-slate-950">
                Perguntas existentes
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                {questions.length} {questions.length === 1 ? "pergunta" : "perguntas"}
              </p>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <FileQuestion className="mx-auto text-slate-300" size={30} />
              <p className="mt-3 text-sm font-black text-slate-800">
                Ainda não existem perguntas.
              </p>
            </div>
          ) : (
            questions.map((item, index) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">
                      Pergunta {index + 1}
                    </span>
                    <p className="mt-2 text-sm font-black leading-6 text-slate-950">
                      {item.question}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <ActionButton
                      icon={Edit3}
                      label="Editar"
                      onClick={() => startEdit(item)}
                    />
                    <ActionButton
                      icon={Trash2}
                      label="Eliminar"
                      tone="danger"
                      onClick={() =>
                        onDelete(course.id, item.id)
                      }
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {(item.options || []).map((option, optionIndex) => (
                    <div
                      key={`${item.id}-${optionIndex}`}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold ${
                        (typeof item.correct_answer === "number" &&
                          item.correct_answer === optionIndex) ||
                        (typeof option === "object" &&
                          String(item.correct_answer) ===
                            String(option.id))
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-slate-50 text-slate-600"
                      }`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[11px] font-black">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span className="flex-1">
                        {optionText(option)}
                      </span>
                    </div>
                  ))}
                </div>

                {item.explanation && (
                  <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                    {item.explanation}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </ModalShell>
  );
}

function UserCreateModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        email: email.trim(),
        password,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title="Novo utilizador"
      subtitle="A API de registo cria uma conta de estudante. A função pode depois ser alterada."
      onClose={onClose}
      width="max-w-xl"
    >
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Nome completo"
          value={name}
          onChange={setName}
          placeholder="Nome do utilizador"
          required
        />

        <Field
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="utilizador@email.com"
          type="email"
          required
        />

        <Field
          label="Palavra-passe inicial"
          value={password}
          onChange={setPassword}
          placeholder="Defina uma palavra-passe"
          type="password"
          required
        />

        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-5 text-blue-900">
          O endpoint actual de registo cria o utilizador inicialmente com a
          função <strong>student</strong>.
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onClose}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton type="submit" loading={saving}>
            Criar utilizador
          </PrimaryButton>
        </div>
      </form>
    </ModalShell>
  );
}

/* ============================================================
   ATOMIC UI
============================================================ */

function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search
        size={17}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
      />
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  tone = "neutral",
}) {
  const tones = {
    neutral:
      "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700",
    blue:
      "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100",
    emerald:
      "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    danger:
      "border-red-100 bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[11px] font-black transition ${tones[tone]}`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-800">
        {label}
        {required && <span className="ml-1 text-blue-600">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-800">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

function PrimaryButton({
  children,
  type = "button",
  onClick,
  loading = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
    >
      {loading && (
        <RefreshCw size={16} className="animate-spin" />
      )}
      {children}
    </button>
  );
}

function SecondaryButton({ children, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
  actionLabel,
  onAction,
}) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
        <Icon size={25} />
      </div>
      <h3 className="mt-4 text-base font-black text-slate-900">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {text}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function AdminToast({ type, message, onClose }) {
  const tone = toastTone(type);
  const Icon = tone.Icon;

  return (
    <div className="fixed bottom-5 right-5 z-[150] w-[min(92vw,420px)]">
      <div
        className={`rounded-2xl border p-4 shadow-2xl ${tone.wrapper}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}
          >
            <Icon size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black">{tone.title}</p>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="h-64 animate-pulse rounded-[32px] bg-slate-200" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-36 animate-pulse rounded-[24px] bg-slate-200"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-[28px] bg-slate-200" />
    </div>
  );
}
