import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Award,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: LayoutDashboard,
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

function getInitials(name) {
  return String(name || "Administrador")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const fullName = user?.name?.trim() || "Administrador";

  function closeMobile() {
    setMobileOpen(false);
  }

  function handleLogout() {
    if (window.confirm("Deseja terminar a sessão?")) {
      logout();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <ShieldCheck size={22} />
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-slate-950">
                SICSI III
              </p>

              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Administração
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeMobile}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <p className="px-3 pb-3 pt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            Gestão
          </p>

          <div className="space-y-1.5">
            {links.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon size={17} />
                    </span>

                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-black text-blue-700">
              {getInitials(fullName)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-900">
                {fullName}
              </p>

              <p className="text-xs font-semibold text-slate-400">
                Administrador
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <LogOut size={17} />
            </span>

            Terminar sessão
          </button>
        </div>
      </aside>

      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={21} />
            </button>

            <div className="hidden lg:block">
              <p className="text-sm font-black text-slate-900">
                Painel Administrativo
              </p>

              <p className="text-xs font-medium text-slate-400">
                Gestão da plataforma SICSI III
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-black text-slate-900">
                  {fullName}
                </p>

                <p className="text-xs font-semibold text-slate-400">
                  Administrador
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white">
                {getInitials(fullName)}
              </div>
            </div>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
