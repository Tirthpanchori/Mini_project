import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function RecentTeacherQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get("/quiz/recent-quizzes/");
        setQuizzes(res.data);
      } catch (err) {
        console.error("Error fetching teacher quizzes:", err);
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFF] px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">📘 My Quizzes</h1>
        <p className="text-gray-600 mb-8">
          Here are all quizzes you’ve created and their total attempt counts.
        </p>

        {quizzes.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No quizzes created yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white shadow-md rounded-2xl p-5 border border-blue-100 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                onClick={() => {
                  // 🧭 pseudo-navigation — will be replaced with real route later
                  navigate(`/teacher/quiz/${quiz.id}/analysis`);
                }}
              >
                <h2 className="text-lg font-semibold text-blue-700 mb-2">
                  🧠 {quiz.title}
                </h2>
                <div className="text-gray-600 text-sm space-y-1">
                  <p>
                    📅 Created at:{" "}
                    {new Date(quiz.created_at).toLocaleString()}
                  </p>
                  <p>❓ Total Questions: {quiz.total_questions}</p>
                  <p>👥 Attempts: {quiz.attempts_count}</p>
                  <p>
                    🔢 Code:{" "}
                    <span className="font-mono text-gray-800">{quiz.code}</span>
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // 🧭 pseudo-navigation for future teacher analytics page
                    navigate(`/teacher/quiz/${quiz.id}/analysis`);
                  }}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-all"
                >
                  View Analysis →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentTeacherQuizzes;
