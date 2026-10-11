import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

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

import SimulationsPage from "./pages/student/SimulationsPage";
import SimulationPage from "./pages/student/SimulationPage";
import PhishingFinalReportPage from "./pages/student/PhishingFinalReportPage";

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
          {/* =====================================================
              ÁREA PÚBLICA
          ====================================================== */}

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

          {/* =====================================================
              ÁREA DO ESTUDANTE
          ====================================================== */}

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

              {/* CURSOS */}

              <Route
                path="/student/cursos"
                element={
                  <CoursesPage />
                }
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

              {/* SIMULAÇÕES */}

              <Route
                path="/student/simulacoes"
                element={
                  <SimulationsPage />
                }
              />

                            <Route
                path="/student/simulacoes/phishing"
                element={
                  <Navigate
                    to="/student/simulacoes/phishing-01"
                    replace
                  />
                }
              />

              
                }
              />

              
                }
              />

                            <Route
                path="/student/simulacoes/phishing/resultado-final"
                element={<PhishingFinalReportPage />}
              />
<Route
                path="/student/simulacoes/:simulationId"
                element={
                  <SimulationPage />
                }
              />
{/* CERTIFICADOS */}

              <Route
                path="/student/certificados"
                element={
                  <CertificatesPage />
                }
              />

              {/* DEFINIÇÕES */}

              <Route
                path="/student/definicoes"
                element={
                  <SettingsPage />
                }
              />
            </Route>
          </Route>

          {/* =====================================================
              AUTOAVALIAÇÃO INICIAL
          ====================================================== */}

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

          {/* =====================================================
              ÁREA ADMINISTRATIVA
          ====================================================== */}

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

          {/* =====================================================
              FALLBACK
          ====================================================== */}

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