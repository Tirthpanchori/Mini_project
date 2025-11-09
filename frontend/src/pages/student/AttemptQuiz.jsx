import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AttemptQuiz() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleStartQuiz = async () => {
    if (!code.trim()) {
      setError("Please enter a quiz code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/attempts/verify-code/", { code });
      const quiz = res.data.quiz;
      navigate(`/quiz/${quiz.quiz_id}/start`, { state: { quiz } });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to verify quiz code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#e3eeff] to-[#f7faff]">
      <div className="bg-white p-10 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.1)] max-w-sm w-full text-center">
        <h2 className="font-poppins text-[#1a237e] mb-5 text-2xl font-bold">
          Enter Quiz Code
        </h2>

        <input
          type="text"
          placeholder="e.g. X7AB9Q"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-4/5 p-3 text-lg border-2 border-[#4d90fe] rounded-lg mb-5 outline-none text-center tracking-widest font-medium transition-all duration-300 focus:border-[#1a73e8]"
        />

        <button
          onClick={handleStartQuiz}
          disabled={loading}
          className={`text-white text-lg px-6 py-2 rounded-lg transition-all duration-300 transform 
            ${
              loading
                ? "bg-[#a0c2ff] cursor-not-allowed"
                : "bg-[#4d90fe] hover:bg-[#1a73e8] active:scale-95"
            }`}
        >
          {loading ? "Checking..." : "Start Quiz"}
        </button>

        {error && (
          <p className="text-red-600 mt-4 font-medium text-sm sm:text-base">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default AttemptQuiz;
