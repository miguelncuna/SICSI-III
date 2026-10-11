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
import Phishing01Page from "./pages/student/simulations/phishing/Phishing01Page";
import Phishing02Page from "./pages/student/simulations/phishing/Phishing02Page";
import Phishing03Page from "./pages/student/simulations/phishing/Phishing03Page";
import Phishing04Page from "./pages/student/simulations/phishing/Phishing04Page";
import Phishing05Page from "./pages/student/simulations/phishing/Phishing05Page";

import SimulationsPage from "./pages/student/SimulationsPage";
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








              <Route
                path="/student/simulacoes/phishing/01"
                element={
                  <Phishing01Page />
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

              <Route
                path="/student/simulacoes/phishing/02"
                element={
                  <Phishing02Page />
                }
              />

              <Route
                path="/student/simulacoes/phishing/03"
                element={
                  <Phishing03Page />
                }
              />

              <Route
                path="/student/simulacoes/phishing/04"
                element={
                  <Phishing04Page />
                }
              />

              <Route
                path="/student/simulacoes/phishing/05"
                element={
                  <Phishing05Page />
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











