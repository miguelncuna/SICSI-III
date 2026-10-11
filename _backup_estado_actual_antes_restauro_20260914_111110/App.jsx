import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/public/HomePage";
import AboutPage from "./pages/public/AboutPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";

import StudentLayout from "./layouts/StudentLayout";

import AssessmentPage from "./pages/student/AssessmentPage";
import StudentDashboardPage from "./pages/student/StudentDashboardPage";
import CoursesPage from "./pages/student/CoursesPage";
import CourseLearningPage from "./pages/student/CourseLearningPage";
import CourseTestPage from "./pages/student/CourseTestPage";
import CertificatesPage from "./pages/student/CertificatesPage";
import SimulationPage from "./pages/student/SimulationPage";

import Phishing04Page from "./pages/student/Phishing04Page";
import Phishing05Page from "./pages/student/Phishing05Page";

import { SimulationsPage } from "./pages/student/StudentPlaceholders";
import SettingsPage from "./pages/student/SettingsPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

function AdminPlaceholder() {
  return (
    <div className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="text-3xl font-black">
        Área Administrativa
      </h1>

      <p className="mt-2 text-slate-500">
        Gestão administrativa do SICSI III.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/sobre"
            element={<AboutPage />}
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/registo"
            element={<RegisterPage />}
          />

          <Route
            element={
              <ProtectedRoute role="student" />
            }
          >
            <Route
              element={<StudentLayout />}
            >
              <Route
                path="/student"
                element={
                  <StudentDashboardPage />
                }
              />

              <Route
                path="/student/cursos"
                element={<CoursesPage />}
              />

              <Route
                path="/student/cursos/:courseId"
                element={
                  <CourseLearningPage />
                }
              />

              <Route
                path="/student/cursos/:courseId/teste"
                element={
                  <CourseTestPage />
                }
              />

              <Route
                path="/student/simulacoes"
                element={
                  <SimulationsPage />
                }
              />

              {/* ==================================================
                  PHISHING 04 — ROTA ESPECÍFICA
                 ================================================== */}
              <Route
                path="/student/simulacoes/phishing-04"
                element={
                  <Phishing04Page />
                }
              />

              {/* ==================================================
                  PHISHING 05 — ROTA ESPECÍFICA
                 ================================================== */}
              <Route
                path="/student/simulacoes/phishing-05"
                element={
                  <Phishing05Page />
                }
              />

              {/* ==================================================
                  OUTRAS SIMULAÇÕES — ROTA DINÂMICA
                 ================================================== */}
              <Route
                path="/student/simulacoes/:simulationId"
                element={
                  <SimulationPage />
                }
              />

              <Route
                path="/student/certificados"
                element={
                  <CertificatesPage />
                }
              />

              <Route
                path="/student/definicoes"
                element={
                  <SettingsPage />
                }
              />
            </Route>
          </Route>

          <Route
            element={
              <ProtectedRoute role="student" />
            }
          >
            <Route
              path="/student/autoavaliacao"
              element={
                <AssessmentPage />
              }
            />
          </Route>

          <Route
            element={
              <ProtectedRoute role="admin" />
            }
          >
            <Route
              path="/admin/*"
              element={
                <AdminDashboardPage />
              }
            />
          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}