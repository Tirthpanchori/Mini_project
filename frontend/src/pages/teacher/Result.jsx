import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function ResultTeacher() {
  const { id: attemptId } = useParams(); // /teacher/results/:id
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherResult = async () => {
      try {
        const res = await api.get(`quiz/teacher/attempts/result/${attemptId}/`);
        setResult(res.data);
      } catch (err) {
        console.error("Failed to fetch teacher result:", err);
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherResult();
  }, [attemptId]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading result...
      </div>
    );

  if (!result)
    return (
      <div className="text-center mt-10">
        <p className="text-gray-600 mb-4">No result data found.</p>
        <button
          onClick={() => navigate("/teacher")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );

  const {
    quiz_title,
    student_name,
    student_email,
    attempted_at,
    score,
    correct_answers,
    total_questions,
    results,
  } = result;

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex justify-center p-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-4">
          {quiz_title || "Quiz Result"}
        </h2>

        {/* Student Info */}
        <div className="mb-6 text-center">
          <p className="text-gray-800 text-lg font-semibold">
            👤 {student_name}
          </p>
          <p className="text-gray-500 text-sm">{student_email}</p>
          <p className="text-gray-500 mt-1">
            Attempted on:{" "}
            <span className="font-medium">
              {new Date(attempted_at).toLocaleString()}
            </span>
          </p>
        </div>

        {/* Score Summary */}
        <div className="text-center mb-6">
          <p className="text-lg text-gray-700">
            Score:{" "}
            <span className="font-bold text-blue-600">{score.toFixed(2)}%</span>
          </p>
          <p className="text-gray-600">
            {correct_answers} / {total_questions} correct
          </p>
        </div>

        {/* Detailed Review */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Detailed Analysis
        </h3>
        <div className="space-y-4">
          {results.map((q, i) => (
            <div
              key={q.question_id}
              className={`p-4 rounded-lg border ${
                q.is_correct
                  ? "border-green-400 bg-green-50"
                  : "border-red-400 bg-red-50"
              }`}
            >
              <h4 className="font-medium text-gray-800 mb-2">
                {i + 1}. {q.question_text}
              </h4>
              <p>
                Student’s Answer:{" "}
                <span
                  className={`font-semibold ${
                    q.is_correct ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {q.selected_option} — {q.selected_option_text}
                </span>
              </p>
              <p>
                Correct Answer:{" "}
                <span className="font-semibold text-green-700">
                  {q.correct_option} — {q.correct_option_text}
                </span>
              </p>
              <p>
                Result:{" "}
                <span
                  className={`font-bold ${
                    q.is_correct ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {q.is_correct ? "✅ Correct" : "❌ Wrong"}
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            ← Back to Attempts
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultTeacher;
