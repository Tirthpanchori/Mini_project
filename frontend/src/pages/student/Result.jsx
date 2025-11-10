import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state; // This is res.data passed via navigate()
  const { id } = useParams(); // quiz_id (optional)

  if (!result) {
    // if user refreshed and lost state
    return (
      <div className="text-center mt-10">
        <p className="text-gray-600 mb-4">No result data found.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { score, correct_answers, total_questions, results } = result;

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex justify-center p-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-4">
          Quiz Result
        </h2>
        <div className="text-center mb-6">
          <p className="text-lg text-gray-700">
            Score:{" "}
            <span className="font-bold text-blue-600">{score.toFixed(2)}%</span>
          </p>
          <p className="text-gray-600">
            {correct_answers} / {total_questions} correct
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Detailed Review
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
                Your Answer:{" "}
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

        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/student")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;
