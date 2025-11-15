import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function RecentQuizzes() {
  const [attempts, setAttempts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await api.get("/attempts/recent-quizzes/"); // your backend endpoint
        setAttempts(res.data);
      } catch (error) {
        console.error("Error fetching recent quizzes:", error);
      }
    };
    fetchAttempts();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFF] px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Recent Quizzes</h1>
        <p className="text-gray-600 mb-8">Here are your previously attempted quizzes.</p>

        {attempts.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No quizzes attempted yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="bg-white shadow-md rounded-2xl p-5 border border-blue-100 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                onClick={() => navigate(`/result/${attempt.id}`)}
              >
                <h2 className="text-lg font-semibold text-blue-700 mb-2">🧠 {attempt.quiz.title}</h2>
                <div className="text-gray-600 text-sm space-y-1">
                  {/* <p>👨‍🏫 Created by: {attempt.code.created_by?.username || "N/A"}</p> */}
                  <p>🕓 Attempted at: {new Date(attempt.attempted_at).toLocaleString()}</p>
                  <p>🏆 Score: {attempt.score}%</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/result/${attempt.id}`);
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

export default RecentQuizzes;
