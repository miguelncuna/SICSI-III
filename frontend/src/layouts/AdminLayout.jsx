import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Award,
  BookOpen,
  ChevronRight,
  House,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const mainNavigation = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: House,
    end: true,
  },
  {
    label: "Cursos",
    to: "/admin/cursos",
    icon: BookOpen,
  },
  {
    label: "Utilizadores",
    to: "/admin/utilizadores",
    icon: Users,
  },
  {
    label: "Certificados",
    to: "/admin/certificados",
    icon: Award,
  },
];

const accountNavigation = [
  {
    label: "Definições",
    to: "/admin/definicoes",
    icon: Settings,
  },
];

function getInitials(name) {
  if (!name) return "A";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function SidebarLink({ item, onNavigate }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
          isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
            : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
              isActive
                ? "bg-white/15 text-white"
                : "bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-blue-600"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>

          <span className="flex-1 min-w-0 truncate">
            {item.label}
          </span>

          <ChevronRight
            className={`h-4 w-4 shrink-0 transition-all ${
              isActive
                ? "translate-x-0 opacity-100"
                : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
            }`}
          />

          {isActive && (
            <span className="absolute -right-4 top-1/2 hidden h-8 w-1 -translate-y-1/2 rounded-l-full bg-blue-600 xl:block" />
          )}
        </>
      )}
    </NavLink>
  );
}

function SidebarStructure({
  fullName,
  initials,
  onNavigate,
}) {
  return (
    <>
      {/* ============================================================
          MARCA
      ============================================================ */}
      <div className="px-5 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/20">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <p className="text-xl font-black tracking-tight text-slate-950">
              SICSI <span className="text-blue-600">III</span>
            </p>

            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Painel Administrativo
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================
          PERFIL
      ============================================================ */}
      <div className="px-5">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white shadow-md shadow-blue-600/20">
            {initials}
          </div>

          <div className="min-w-0">
            <p
              className="min-w-0 truncate text-sm font-bold text-slate-800"
              title={fullName}
            >
              {fullName}
            </p>

            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
              Administrador
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================
          NAVEGAÇÃO PRINCIPAL
      ============================================================ */}
      <nav className="mt-7 flex-1 px-4">
        <div className="space-y-1">
          {mainNavigation.map((item) => (
            <SidebarLink
              key={item.to}
              item={item}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <div className="my-6 border-t border-slate-100" />

        {/* ============================================================
            CONTA
        ============================================================ */}
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Conta
        </p>

        <div className="space-y-1">
          {accountNavigation.map((item) => (
            <SidebarLink
              key={item.to}
              item={item}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>
    </>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const fullName = user?.name?.trim() || "Administrador";
  const initials = getInitials(fullName);

  /* ==============================================================
     FECHAR MENU AO MUDAR DE ROTA
  ============================================================== */
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* ==============================================================
     BLOQUEAR SCROLL QUANDO DRAWER/MODAL ESTIVER ABERTO
  ============================================================== */
  useEffect(() => {
    document.body.style.overflow =
      menuOpen || logoutOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, logoutOpen]);

  /* ==============================================================
     ESC
  ============================================================== */
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setLogoutOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleLogout() {
    setLogoutOpen(false);
    setMenuOpen(false);
    logout();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ============================================================
          SIDEBAR DESKTOP
          MESMA ESTRUTURA DO STUDENTLAYOUT
      ============================================================ */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-slate-200 bg-white xl:flex">
        <SidebarStructure
          fullName={fullName}
          initials={initials}
        />

        {/* LOGOUT */}
        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 transition-colors group-hover:bg-red-100">
              <LogOut className="h-4 w-4" />
            </span>

            <span>Terminar sessão</span>

            <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
          </button>
        </div>
      </aside>

      {/* ============================================================
          OVERLAY MOBILE / TABLET
      ============================================================ */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] xl:hidden"
        />
      )}

      {/* ============================================================
          SIDEBAR MOBILE / TABLET
          MESMA LÓGICA DO STUDENTLAYOUT
      ============================================================ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(86vw,320px)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 xl:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="font-black tracking-tight text-slate-950">
                SICSI <span className="text-blue-600">III</span>
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Painel Administrativo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarStructure
            fullName={fullName}
            initials={initials}
            onNavigate={() => setMenuOpen(false)}
          />
        </div>

        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setLogoutOpen(true);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">
              <LogOut className="h-4 w-4" />
            </span>

            Terminar sessão
          </button>
        </div>
      </aside>

      {/* ============================================================
          ÁREA PRINCIPAL
      ============================================================ */}
      <main className="min-h-screen min-w-0 xl:ml-72">
        {/* HEADER MOBILE */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl xl:hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate font-black tracking-tight text-slate-950">
                  SICSI <span className="text-blue-600">III</span>
                </p>

                <p className="truncate text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Administração
                </p>
              </div>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-black text-blue-700">
              {initials}
            </div>
          </div>
        </header>

        {/* CONTEÚDO */}
        <div className="min-h-screen min-w-0 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10 xl:py-10">
          <div className="mx-auto w-full max-w-[1480px] min-w-0">
            <Outlet />
          </div>
        </div>
      </main>

      {/* ============================================================
          MODAL DE LOGOUT
      ============================================================ */}
      {logoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-5 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-logout-title"
            className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="p-6 sm:p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <LogOut className="h-5 w-5" />
              </div>

              <h2
                id="admin-logout-title"
                className="mt-5 text-xl font-bold text-slate-950"
              >
                Terminar sessão?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                A sua sessão administrativa será encerrada.
              </p>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setLogoutOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
                >
                  Terminar sessão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
