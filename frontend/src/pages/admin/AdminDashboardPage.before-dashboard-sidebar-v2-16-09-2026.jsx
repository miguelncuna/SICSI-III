import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Edit3,
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
      data?.detail || data?.message || "Erro ao comunicar com o servidor."
    );
  }

  return data;
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [activeSection, setActiveSection] = useState("dashboard");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [courseSearch, setCourseSearch] = useState("");
  const [certificateSearch, setCertificateSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [mobileSidebar, setMobileSidebar] = useState(false);

  function notify(text, type = "success") {
    setMessage(text);
    setMessageType(type);
  }

  async function load(showSpinner = true) {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const [s, c, u, cert] = await Promise.all([
        api("/admin/stats"),
        api("/admin/courses"),
        api("/users"),
        api("/certificates"),
      ]);

      setStats(s);
      setCourses(Array.isArray(c) ? c : []);
      setUsers(Array.isArray(u) ? u : []);
      setCertificates(Array.isArray(cert) ? cert : []);

      if (selectedCourse) {
        const updated = Array.isArray(c)
          ? c.find((item) => item.id === selectedCourse.id)
          : null;

        setSelectedCourse(updated || null);
      }
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

  async function refreshData() {
    setRefreshing(true);
    await load(false);
    notify("Dados actualizados com sucesso.");
  }

  async function openCourse(id) {
    try {
      const course = await api(`/courses/${id}`);
      setSelectedCourse(course);
      setActiveSection("courses");
      setMobileSidebar(false);
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function createCourse(payload) {
    await api("/admin/courses", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    await load(false);
    notify("Curso criado com sucesso.");
  }

  async function updateCourse(id, payload) {
    await api(`/admin/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    await load(false);
    await openCourse(id);
    notify("Curso actualizado com sucesso.");
  }

  async function deleteCourse(id) {
    if (!window.confirm("Eliminar este curso? Esta operação não pode ser desfeita.")) {
      return;
    }

    try {
      await api(`/admin/courses/${id}`, {
        method: "DELETE",
      });

      if (selectedCourse?.id === id) {
        setSelectedCourse(null);
      }

      await load(false);
      notify("Curso eliminado com sucesso.");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function createLesson(courseId, payload) {
    await api(`/admin/courses/${courseId}/lessons`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    await openCourse(courseId);
    notify("Aula adicionada com sucesso.");
  }

  async function updateLesson(courseId, lessonId, payload) {
    await api(`/admin/courses/${courseId}/lessons/${lessonId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    await openCourse(courseId);
    notify("Aula actualizada com sucesso.");
  }

  async function deleteLesson(courseId, lessonId) {
    if (!window.confirm("Remover esta aula?")) {
      return;
    }

    try {
      await api(`/admin/courses/${courseId}/lessons/${lessonId}`, {
        method: "DELETE",
      });

      await openCourse(courseId);
      notify("Aula removida com sucesso.");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function createQuestion(courseId, payload) {
    await api(`/admin/courses/${courseId}/questions`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    await openCourse(courseId);
    notify("Pergunta adicionada com sucesso.");
  }

  async function updateQuestion(courseId, questionId, payload) {
    await api(`/admin/courses/${courseId}/questions/${questionId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    await openCourse(courseId);
    notify("Pergunta actualizada com sucesso.");
  }

  async function deleteQuestion(courseId, questionId) {
    if (!window.confirm("Remover esta pergunta?")) {
      return;
    }

    try {
      await api(`/admin/courses/${courseId}/questions/${questionId}`, {
        method: "DELETE",
      });

      await openCourse(courseId);
      notify("Pergunta removida com sucesso.");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function toggleRole(targetUser) {
    const nextRole = targetUser.role === "admin" ? "student" : "admin";

    if (
      !window.confirm(
        nextRole === "admin"
          ? `Promover ${targetUser.name} a administrador?`
          : `Remover privilégios de administrador de ${targetUser.name}?`
      )
    ) {
      return;
    }

    try {
      await api(`/users/${targetUser.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: nextRole }),
      });

      await load(false);

      notify(
        nextRole === "admin"
          ? "Utilizador promovido a administrador."
          : "Utilizador voltou a ser estudante."
      );
    } catch (error) {
      notify(error.message, "error");
    }
  }

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();

    return users.filter((item) => {
      const matchesSearch =
        !query ||
        String(item.name || "").toLowerCase().includes(query) ||
        String(item.email || "").toLowerCase().includes(query);

      const matchesRole =
        userRoleFilter === "all" || item.role === userRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, userRoleFilter]);

  const filteredCourses = useMemo(() => {
    const query = courseSearch.trim().toLowerCase();

    return courses.filter(
      (course) =>
        !query ||
        String(course.title || "").toLowerCase().includes(query) ||
        String(course.description || "").toLowerCase().includes(query)
    );
  }, [courses, courseSearch]);

  const filteredCertificates = useMemo(() => {
    const query = certificateSearch.trim().toLowerCase();

    return certificates.filter(
      (certificate) =>
        !query ||
        String(certificate.student_name || "").toLowerCase().includes(query) ||
        String(certificate.course_title || "").toLowerCase().includes(query)
    );
  }, [certificates, certificateSearch]);

  const adminName = user?.name?.trim() || "Administrador";
  const adminInitial = adminName.charAt(0).toUpperCase();

  function navigate(section) {
    setActiveSection(section);
    setMobileSidebar(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col bg-[#071a33] text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          mobileSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-5 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/30">
                <ShieldCheck size={24} />
              </div>

              <div>
                <p className="text-lg font-black tracking-tight">SICSI III</p>
                <p className="text-xs text-slate-400">Painel administrativo</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-5">
            <p className="px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Gestão
            </p>

            <div className="mt-3 space-y-1.5">
              <SidebarItem
                icon={LayoutDashboard}
                label="Dashboard"
                active={activeSection === "dashboard"}
                onClick={() => navigate("dashboard")}
              />

              <SidebarItem
                icon={BookOpen}
                label="Cursos"
                active={activeSection === "courses"}
                onClick={() => navigate("courses")}
              />

              <SidebarItem
                icon={Users}
                label="Utilizadores"
                active={activeSection === "users"}
                onClick={() => navigate("users")}
              />

              <SidebarItem
                icon={Award}
                label="Certificados"
                active={activeSection === "certificates"}
                onClick={() => navigate("certificates")}
              />
            </div>
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-2xl bg-white/5 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-black">
                  {adminInitial}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{adminName}</p>
                  <p className="text-xs text-slate-400">Administrador</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut size={18} />
              Terminar sessão
            </button>
          </div>
        </div>
      </aside>

      {mobileSidebar && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMobileSidebar(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-[76px] items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileSidebar(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>

            <div className="hidden flex-1 md:block">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Administração
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Gestão central do SICSI III
              </p>
            </div>

            <button
              type="button"
              onClick={refreshData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
              {adminInitial}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-76px)] p-4 sm:p-6 xl:p-8">
          <div className="mx-auto max-w-[1600px]">
            {message && (
              <div
                className={`mb-6 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm ${
                  messageType === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                <p>{message}</p>
                <button
                  type="button"
                  onClick={() => setMessage("")}
                  className="shrink-0 rounded-lg p-1 hover:bg-black/5"
                  aria-label="Fechar mensagem"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {loading ? (
              <AdminSkeleton />
            ) : activeSection === "dashboard" ? (
              <DashboardView
                stats={stats}
                courses={courses}
                users={users}
                certificates={certificates}
                onNavigate={navigate}
                onOpenCourse={openCourse}
              />
            ) : activeSection === "courses" ? (
              <CoursesView
                courses={filteredCourses}
                totalCourses={courses.length}
                search={courseSearch}
                onSearch={setCourseSearch}
                selectedCourse={selectedCourse}
                onOpenCourse={openCourse}
                onCreateCourse={createCourse}
                onUpdateCourse={updateCourse}
                onDeleteCourse={deleteCourse}
                onCreateLesson={createLesson}
                onUpdateLesson={updateLesson}
                onDeleteLesson={deleteLesson}
                onCreateQuestion={createQuestion}
                onUpdateQuestion={updateQuestion}
                onDeleteQuestion={deleteQuestion}
              />
            ) : activeSection === "users" ? (
              <UsersView
                users={filteredUsers}
                totalUsers={users.length}
                search={userSearch}
                onSearch={setUserSearch}
                roleFilter={userRoleFilter}
                onRoleFilter={setUserRoleFilter}
                onToggleRole={toggleRole}
              />
            ) : (
              <CertificatesView
                certificates={filteredCertificates}
                totalCertificates={certificates.length}
                search={certificateSearch}
                onSearch={setCertificateSearch}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardView({
  stats,
  courses,
  users,
  certificates,
  onNavigate,
  onOpenCourse,
}) {
  const recentCourses = courses.slice(-4).reverse();
  const recentUsers = users.slice(-5).reverse();
  const recentCertificates = certificates.slice(-4).reverse();

  return (
    <>
      <SectionHeader
        eyebrow="Visão geral"
        title="Dashboard"
        description="Acompanhe os principais indicadores e faça a gestão diária da plataforma."
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Users}
          label="Utilizadores"
          value={stats?.users ?? users.length}
          helper="Contas registadas"
        />
        <KpiCard
          icon={BookOpen}
          label="Cursos"
          value={stats?.courses ?? courses.length}
          helper="Formações disponíveis"
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
          value={stats?.admins ?? users.filter((item) => item.role === "admin").length}
          helper="Contas com acesso administrativo"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Actividade recente
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Visão rápida do conteúdo e das contas da plataforma.
              </p>
            </div>

            <div className="hidden rounded-xl bg-blue-50 p-2.5 text-blue-600 sm:block">
              <BarChart3 size={19} />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {recentCourses.length === 0 && recentUsers.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="Ainda não existem dados suficientes"
                description="Comece por criar cursos ou registar utilizadores."
              />
            ) : (
              <>
                {recentCourses.slice(0, 2).map((course) => (
                  <button
                    key={`course-${course.id}`}
                    type="button"
                    onClick={() => onOpenCourse(course.id)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <BookOpen size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">{course.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Curso · {course.lessons_count ?? course.lessons?.length ?? 0} aulas
                      </p>
                    </div>

                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                ))}

                {recentUsers.slice(0, 3).map((item) => (
                  <div
                    key={`user-${item.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-700">
                      {(item.name || "U").charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-slate-900">
                        {item.name}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {item.email}
                      </p>
                    </div>

                    <RoleBadge role={item.role} />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Acções rápidas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Acesso directo às áreas de gestão.
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            <QuickAction
              icon={BookOpen}
              label="Gerir cursos"
              description="Criar, editar e organizar formações"
              onClick={() => onNavigate("courses")}
            />

            <QuickAction
              icon={Users}
              label="Gerir utilizadores"
              description="Consultar contas e funções"
              onClick={() => onNavigate("users")}
            />

            <QuickAction
              icon={Award}
              label="Ver certificados"
              description="Consultar certificações emitidas"
              onClick={() => onNavigate("certificates")}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-[#071a33] p-5 text-white">
            <div className="flex items-center gap-3">
              <ShieldCheck size={21} className="text-blue-400" />
              <p className="text-sm font-bold">Estado do SICSI III</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              O painel está ligado aos módulos de cursos, utilizadores e
              certificados.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <DataPreview
          title="Cursos recentes"
          actionLabel="Ver todos"
          onAction={() => onNavigate("courses")}
        >
          {recentCourses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Sem cursos"
              description="Ainda não existem cursos registados."
            />
          ) : (
            recentCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">
                    {course.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {course.questions_count ?? course.questions?.length ?? 0}/10 perguntas
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenCourse(course.id)}
                  className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  aria-label="Abrir curso"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            ))
          )}
        </DataPreview>

        <DataPreview
          title="Certificados recentes"
          actionLabel="Ver todos"
          onAction={() => onNavigate("certificates")}
        >
          {recentCertificates.length === 0 ? (
            <EmptyState
              icon={Award}
              title="Sem certificados"
              description="Ainda não existem certificados emitidos."
            />
          ) : (
            recentCertificates.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">
                    {item.student_name}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {item.course_title}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  Emitido
                </span>
              </div>
            ))
          )}
        </DataPreview>
      </div>
    </>
  );
}

function CoursesView({
  courses,
  totalCourses,
  search,
  onSearch,
  selectedCourse,
  onOpenCourse,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
  onCreateLesson,
  onUpdateLesson,
  onDeleteLesson,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <SectionHeader
        eyebrow="Gestão de conteúdo"
        title="Cursos"
        description={`Gerencie as formações da plataforma. ${totalCourses} curso(s) registado(s).`}
        action={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={17} />
            Novo curso
          </button>
        }
      />

      <div className="mt-7 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-black text-slate-900">Biblioteca</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              {courses.length}
            </span>
          </div>

          <div className="relative mt-4">
            <Search
              size={17}
              className="absolute left-3 top-3.5 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Pesquisar cursos..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </div>

          <div className="mt-4 space-y-2.5">
            {courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Nenhum curso encontrado"
                description="Crie um curso ou altere a pesquisa."
              />
            ) : (
              courses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => onOpenCourse(course.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedCourse?.id === course.id
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <div
                        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          selectedCourse?.id === course.id
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        <BookOpen size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">
                          {course.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {course.lessons_count ?? course.lessons?.length ?? 0} aulas ·{" "}
                          {course.questions_count ?? course.questions?.length ?? 0}/10
                          perguntas
                        </p>
                      </div>
                    </div>

                    <ChevronRight size={17} className="mt-2 shrink-0 text-slate-400" />
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section>
          {selectedCourse ? (
            <CourseEditor
              key={selectedCourse.id}
              course={selectedCourse}
              onUpdateCourse={onUpdateCourse}
              onDeleteCourse={onDeleteCourse}
              onCreateLesson={onCreateLesson}
              onUpdateLesson={onUpdateLesson}
              onDeleteLesson={onDeleteLesson}
              onCreateQuestion={onCreateQuestion}
              onUpdateQuestion={onUpdateQuestion}
              onDeleteQuestion={onDeleteQuestion}
            />
          ) : (
            <div className="flex min-h-[560px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <div className="max-w-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <BookOpen size={28} />
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-900">
                  Seleccione um curso
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  O editor completo do curso aparecerá aqui, incluindo dados,
                  aulas, vídeos e teste final.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {showCreate && (
        <CourseCreateModal
          onClose={() => setShowCreate(false)}
          onSave={async (payload) => {
            await onCreateCourse(payload);
            setShowCreate(false);
          }}
        />
      )}
    </>
  );
}

function CourseEditor({
  course,
  onUpdateCourse,
  onDeleteCourse,
  onCreateLesson,
  onUpdateLesson,
  onDeleteLesson,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}) {
  const [editCourse, setEditCourse] = useState(false);
  const [title, setTitle] = useState(course.title || "");
  const [description, setDescription] = useState(course.description || "");
  const [published, setPublished] = useState(Boolean(course.published));

  const [lessonForm, setLessonForm] = useState({
    title: "",
    video_url: "",
  });
  const [editingLessonId, setEditingLessonId] = useState(null);

  const [questionForm, setQuestionForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correct_answer: 0,
    explanation: "",
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  async function saveCourse() {
    if (!title.trim()) {
      window.alert("Informe o nome do curso.");
      return;
    }

    await onUpdateCourse(course.id, {
      title: title.trim(),
      description: description.trim(),
      published,
    });

    setEditCourse(false);
  }

  function startEditLesson(lesson) {
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title || "",
      video_url: lesson.video_url || "",
    });
  }

  function resetLessonForm() {
    setEditingLessonId(null);
    setLessonForm({ title: "", video_url: "" });
  }

  async function saveLesson() {
    if (!lessonForm.title.trim() || !lessonForm.video_url.trim()) {
      window.alert("Preencha o título e o URL do vídeo.");
      return;
    }

    if (editingLessonId) {
      await onUpdateLesson(course.id, editingLessonId, {
        title: lessonForm.title.trim(),
        video_url: lessonForm.video_url.trim(),
      });
    } else {
      await onCreateLesson(course.id, {
        title: lessonForm.title.trim(),
        video_url: lessonForm.video_url.trim(),
      });
    }

    resetLessonForm();
  }

  function startEditQuestion(item) {
    setEditingQuestionId(item.id);
    setQuestionForm({
      question: item.question || "",
      options: Array.isArray(item.options)
        ? [...item.options].slice(0, 4)
        : ["", "", "", ""],
      correct_answer: Number(item.correct_answer ?? 0),
      explanation: item.explanation || "",
    });
  }

  function resetQuestionForm() {
    setEditingQuestionId(null);
    setQuestionForm({
      question: "",
      options: ["", "", "", ""],
      correct_answer: 0,
      explanation: "",
    });
  }

  async function saveQuestion() {
    if (
      !questionForm.question.trim() ||
      questionForm.options.some((option) => !option.trim())
    ) {
      window.alert("Preencha a pergunta e as quatro opções.");
      return;
    }

    const payload = {
      question: questionForm.question.trim(),
      options: questionForm.options.map((option) => option.trim()),
      correct_answer: Number(questionForm.correct_answer),
      explanation: questionForm.explanation.trim(),
    };

    if (editingQuestionId) {
      await onUpdateQuestion(course.id, editingQuestionId, payload);
    } else {
      await onCreateQuestion(course.id, payload);
    }

    resetQuestionForm();
  }

  const lessons = Array.isArray(course.lessons) ? course.lessons : [];
  const questions = Array.isArray(course.questions) ? course.questions : [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <BookOpen size={24} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                Editor do curso
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                {course.title}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-600">
                  {lessons.length} aulas
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-600">
                  {questions.length}/10 perguntas
                </span>
                <span
                  className={`rounded-full px-3 py-1.5 font-semibold ${
                    course.published
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {course.published ? "Publicado" : "Rascunho"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditCourse((value) => !value)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <Edit3 size={16} />
              Editar curso
            </button>

            <button
              type="button"
              onClick={() => onDeleteCourse(course.id)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </div>
        </div>

        {editCourse && (
          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6">
            <Field
              label="Nome do curso"
              value={title}
              onChange={setTitle}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Descrição
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
              />
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
              <input
                type="checkbox"
                checked={published}
                onChange={(event) => setPublished(event.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              <span>
                <span className="block text-sm font-bold text-slate-800">
                  Curso publicado
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  Permitir que o curso apareça para os estudantes.
                </span>
              </span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveCourse}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                <Check size={16} />
                Guardar
              </button>

              <button
                type="button"
                onClick={() => setEditCourse(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Video size={19} className="text-blue-600" />
              <h3 className="font-black text-slate-900">Aulas e vídeos</h3>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Adicione, edite ou remova o conteúdo vídeo do curso.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            {lessons.length} aulas
          </span>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <Field
              label="Título da aula"
              value={lessonForm.title}
              onChange={(value) =>
                setLessonForm((current) => ({ ...current, title: value }))
              }
              compact
            />

            <Field
              label="URL do vídeo"
              value={lessonForm.video_url}
              onChange={(value) =>
                setLessonForm((current) => ({
                  ...current,
                  video_url: value,
                }))
              }
              compact
            />

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={saveLesson}
                className="inline-flex h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700"
              >
                {editingLessonId ? <Check size={16} /> : <Plus size={16} />}
                {editingLessonId ? "Guardar" : "Adicionar"}
              </button>

              {editingLessonId && (
                <button
                  type="button"
                  onClick={resetLessonForm}
                  className="h-[46px] rounded-xl border border-slate-200 bg-white px-3 text-slate-600"
                  aria-label="Cancelar edição da aula"
                >
                  <X size={17} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {lessons.length === 0 ? (
            <EmptyState
              icon={Video}
              title="Nenhuma aula"
              description="Adicione a primeira aula deste curso."
            />
          ) : (
            lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="rounded-2xl border border-slate-100 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-700">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">
                        {lesson.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {lesson.video_url}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditLesson(lesson)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <Edit3 size={14} />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteLesson(course.id, lesson.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileQuestion size={19} className="text-blue-600" />
              <h3 className="font-black text-slate-900">Teste final</h3>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              O curso permite até 10 perguntas.
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              questions.length >= 10
                ? "bg-emerald-50 text-emerald-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {questions.length}/10
          </span>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Pergunta
              </label>
              <textarea
                rows={3}
                value={questionForm.question}
                onChange={(event) =>
                  setQuestionForm((current) => ({
                    ...current,
                    question: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
                placeholder="Escreva a pergunta..."
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {questionForm.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={Number(questionForm.correct_answer) === index}
                    onChange={() =>
                      setQuestionForm((current) => ({
                        ...current,
                        correct_answer: index,
                      }))
                    }
                    className="h-4 w-4 accent-blue-600"
                    aria-label={`Resposta correcta ${index + 1}`}
                  />

                  <input
                    value={option}
                    onChange={(event) => {
                      const next = [...questionForm.options];
                      next[index] = event.target.value;
                      setQuestionForm((current) => ({
                        ...current,
                        options: next,
                      }));
                    }}
                    placeholder={`Opção ${index + 1}`}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Explicação
              </label>
              <textarea
                rows={3}
                value={questionForm.explanation}
                onChange={(event) =>
                  setQuestionForm((current) => ({
                    ...current,
                    explanation: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
                placeholder="Explique a resposta correcta..."
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!editingQuestionId && questions.length >= 10}
                onClick={saveQuestion}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {editingQuestionId ? <Check size={16} /> : <Plus size={16} />}
                {editingQuestionId ? "Guardar pergunta" : "Adicionar pergunta"}
              </button>

              {(editingQuestionId ||
                questionForm.question ||
                questionForm.options.some(Boolean) ||
                questionForm.explanation) && (
                <button
                  type="button"
                  onClick={resetQuestionForm}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {questions.length === 0 ? (
            <EmptyState
              icon={FileQuestion}
              title="Nenhuma pergunta"
              description="Adicione as perguntas do teste final."
            />
          ) : (
            questions.map((item, index) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-100 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
                      Questão {index + 1}
                    </p>
                    <p className="mt-2 font-bold text-slate-900">
                      {item.question}
                    </p>

                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {(item.options || []).map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`rounded-xl px-3 py-2 text-xs ${
                            Number(item.correct_answer) === optionIndex
                              ? "bg-emerald-50 font-bold text-emerald-700"
                              : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {String.fromCharCode(65 + optionIndex)}. {option}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEditQuestion(item)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <Edit3 size={14} />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(course.id, item.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function UsersView({
  users,
  totalUsers,
  search,
  onSearch,
  roleFilter,
  onRoleFilter,
  onToggleRole,
}) {
  return (
    <>
      <SectionHeader
        eyebrow="Gestão de acesso"
        title="Utilizadores"
        description={`Consulte as contas e controle as funções administrativas. ${totalUsers} utilizador(es).`}
      />

      <section className="mt-7 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-3.5 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Pesquisar nome ou email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => onRoleFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="all">Todas as funções</option>
            <option value="student">Estudantes</option>
            <option value="admin">Administradores</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Utilizador</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Função</th>
                <th className="px-6 py-4 text-right font-bold">Acção</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12">
                    <EmptyState
                      icon={Users}
                      title="Nenhum utilizador encontrado"
                      description="Altere a pesquisa ou o filtro seleccionado."
                    />
                  </td>
                </tr>
              ) : (
                users.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-black text-white">
                          {(item.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            ID: {item.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.email}
                    </td>

                    <td className="px-6 py-4">
                      <RoleBadge role={item.role} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onToggleRole(item)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <UserCog size={14} />
                        {item.role === "admin"
                          ? "Tornar estudante"
                          : "Promover a Admin"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
          A gestão de utilizadores respeita as operações disponibilizadas pelo
          backend actual.
        </div>
      </section>
    </>
  );
}

function CertificatesView({
  certificates,
  totalCertificates,
  search,
  onSearch,
}) {
  return (
    <>
      <SectionHeader
        eyebrow="Certificação"
        title="Certificados"
        description={`Consulte os certificados emitidos pelo SICSI III. ${totalCertificates} certificado(s).`}
      />

      <section className="mt-7 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="relative max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-3.5 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Pesquisar estudante ou curso..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {certificates.length === 0 ? (
            <EmptyState
              icon={Award}
              title="Nenhum certificado encontrado"
              description="Ainda não existem certificações correspondentes à pesquisa."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {certificates.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-100 p-5 transition hover:border-blue-100 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Award size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-black text-slate-900">
                          {item.student_name}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {item.course_title}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      Emitido
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 text-xs">
                    {item.certificate_code && (
                      <span className="rounded-lg bg-slate-100 px-3 py-2 font-mono text-slate-600">
                        {item.certificate_code}
                      </span>
                    )}

                    {item.score !== undefined && item.score !== null && (
                      <span className="rounded-lg bg-blue-50 px-3 py-2 font-bold text-blue-700">
                        Resultado: {item.score}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function CourseCreateModal({ onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(true);

  async function submit(event) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    await onSave({
      title: title.trim(),
      description: description.trim(),
      published,
    });
  }

  return (
    <ModalShell title="Novo curso" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Nome do curso"
          value={title}
          onChange={setTitle}
        />

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Descrição
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white"
          />
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          <span className="text-sm font-semibold text-slate-700">
            Publicar curso imediatamente
          </span>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Criar curso
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-black text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={20} />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400">
          SICSI
        </span>
      </div>

      <p className="mt-6 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 font-bold text-slate-800">{label}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-900">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      <ChevronRight size={17} className="text-slate-400" />
    </button>
  );
}

function DataPreview({ title, actionLabel, onAction, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-black text-slate-900">{title}</h2>
        <button
          type="button"
          onClick={onAction}
          className="text-sm font-bold text-blue-600 hover:text-blue-700"
        >
          {actionLabel}
        </button>
      </div>

      <div className="mt-5 space-y-3">{children}</div>
    </section>
  );
}

function RoleBadge({ role }) {
  const admin = role === "admin";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
        admin
          ? "bg-blue-50 text-blue-700"
          : "bg-slate-100 text-slate-700"
      }`}
    >
      {admin ? "Administrador" : "Estudante"}
    </span>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

function Field({ label, value, onChange, compact = false }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-400 ${
          compact ? "py-3" : "py-3.5"
        }`}
      />
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-7 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
        <Icon size={21} />
      </div>
      <p className="mt-4 font-bold text-slate-800">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-5 w-24 rounded bg-slate-200" />
      <div className="mt-3 h-10 w-60 rounded bg-slate-200" />
      <div className="mt-3 h-5 w-[420px] max-w-full rounded bg-slate-200" />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 rounded-3xl border border-slate-200 bg-white"
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="h-80 rounded-3xl border border-slate-200 bg-white" />
        <div className="h-80 rounded-3xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}
