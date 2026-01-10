import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomeT from "./pages/teacher/Home";
import HomeS from "./pages/student/Home";
import Login from "./pages/accounts/Login";
import Register from "./pages/accounts/Register";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateQuiz from "./pages/teacher/CreateQuiz";
import AttemptQuiz from "./pages/student/AttemptQuiz";
import Start from "./pages/student/Start";
import ResultPage from "./pages/student/Result";
import RecentQuizzes from "./pages/student/RecentQuiz";
import RecentTeacherQuizzes from "./pages/teacher/RecentQuiz";
import StudentsQuiz from "./pages/teacher/StudentsQuiz";
import ResultTeacher from "./pages/teacher/Result";
import LandingPage from "./pages/LandingPage";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />

        {/* Role-based protected routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRole="teacher">
              <HomeT />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-quiz"
          element={
            <ProtectedRoute allowedRole="teacher">
              <CreateQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="student">
              <HomeS />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attempt-quiz"
          element={
            <ProtectedRoute allowedRole="student">
              <AttemptQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:id/start"
          element={
            <ProtectedRoute allowedRole="student">
              <Start />
            </ProtectedRoute>
          }
        />
        <Route
          path="/result/:id"
          element={
            <ProtectedRoute allowedRole="student">
              <ResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recent-quizzes"
          element={
            <ProtectedRoute allowedRole="student">
              <RecentQuizzes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recent-teacher-quizzes"
          element={
            <ProtectedRoute allowedRole="teacher">
              <RecentTeacherQuizzes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/quiz/:id/analysis"
          element={
            <ProtectedRoute allowedRole="teacher">
              <StudentsQuiz/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/results/:id"
          element={
            <ProtectedRoute allowedRole="teacher">
              <ResultTeacher />
            </ProtectedRoute>
          }
        />
          
        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
