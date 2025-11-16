import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

function StudentsAttempts() {
  const { id: quizId } = useParams(); // matches /teacher/quiz/:id/analysis
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await api.get(`/quiz/${quizId}/attempts/`);
        setQuizData(res.data);
      } catch (err) {
        console.error("Error fetching quiz attempts:", err);
        setError("Could not load student attempts.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [quizId]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error)
    return (
      <div className="text-center mt-10 text-red-600">
        <p>{error}</p>
        <button
          onClick={() => navigate("/teacher")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );

  const { quiz_title, quiz_code, attempts } = quizData || {};

  return (
    <div className="min-h-screen bg-[#F8FAFF] px-6 py-10">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        {/* Quiz Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-700">{quiz_title}</h1>
          <p className="text-gray-600 text-lg">
            Code: <span className="font-mono text-blue-600">{quiz_code || "N/A"}</span>
          </p>
          <p className="text-gray-500 mt-1">
            Total Attempts: {quizData.total_attempts}
          </p>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Student Name</th>
                <th className="px-4 py-3 text-left">Attempted At</th>
                <th className="px-4 py-3 text-left">Score</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attempts?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No students have attempted this quiz yet.
                  </td>
                </tr>
              ) : (
                attempts.map((attempt, index) => (
                  <tr
                    key={attempt.attempt_id}
                    className="hover:bg-blue-50 transition cursor-pointer"
                    onClick={() =>
                      navigate(`/result/${attempt.attempt_id}`)
                    }
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {attempt.student_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(attempt.attempted_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-semibold">
                      {attempt.score}%
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/teacher/results/${attempt.attempt_id}`);
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                      >
                        See Analysis →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentsAttempts;
