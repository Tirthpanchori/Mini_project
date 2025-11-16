import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

function Start() {
  const { id } = useParams(); // quiz_id
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null); // live countdown
  const [endTime, setEndTime] = useState(null); // absolute end timestamp
  const navigate = useNavigate();

  // -----------------------------
  // Fetch Quiz + Setup Timer
  // -----------------------------
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/attempts/${id}/questions/`);
        setQuiz(res.data);

        // Check if timer end already stored (for refresh safety)
        const storedEnd = localStorage.getItem(`quiz_end_${id}`);

        if (storedEnd) {
          setEndTime(Number(storedEnd));
        } else {
          const newEnd = Date.now() + res.data.timer * 1000; // convert sec → ms
          localStorage.setItem(`quiz_end_${id}`, newEnd);
          setEndTime(newEnd);
        }
      } catch (err) {
        setError(
          err.response?.data?.detail || "Failed to fetch quiz questions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  // -----------------------------
  // Real countdown tick
  // -----------------------------
  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const remaining = Math.floor((endTime - Date.now()) / 1000);

      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  // -----------------------------
  // Auto-submit when time ends
  // -----------------------------
  useEffect(() => {
    if (timeLeft === 0) {
      alert("Time's up! Auto-submitting your quiz.");
      localStorage.removeItem(`quiz_end_${id}`);
      handleSubmit();
    }
  }, [timeLeft]);

  // -----------------------------
  // Handle option selected
  // -----------------------------
  function handleOptionChange(questionId, selectedOption) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  }

  // -----------------------------
  // Submit function
  // -----------------------------
  async function handleSubmit() {
    if (!quiz) return;

    localStorage.removeItem(`quiz_end_${id}`);

    const formattedAnswers = quiz.questions.map((q) => ({
      question_id: q.id,
      selected_option: answers[q.id] || null,
    }));

    const payload = {
      quiz_id: quiz.quiz_id,
      answers: formattedAnswers,
    };

    console.log("Submitting payload:", payload); // Debug log

    try {
      const res = await api.post(`/attempts/save/`, payload);
      navigate(`/result/${quiz.quiz_id}`, { state: res.data });
      localStorage.setItem("lastAttempt", JSON.stringify(res.data));
    } catch (err) {
      console.error("Submission error:", err.response?.data); // Debug log
      alert(err.response?.data?.detail || "Failed to submit quiz.");
    }
  }

  // -----------------------------
  // UI rendering
  // -----------------------------
  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading quiz...</p>;

  if (error)
    return (
      <p className="text-center mt-10 text-red-600 font-medium">{error}</p>
    );

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex justify-center p-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-8">
        <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">
          {quiz.title}
        </h2>

        {/* LIVE TIMER */}
        <p className="text-center text-red-600 text-xl font-semibold mb-6">
          ⏳ Time Left:{" "}
          {timeLeft !== null
            ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(
                2,
                "0"
              )}`
            : "Loading..."}
        </p>

        {quiz.questions.map((q, i) => (
          <div
            key={q.id}
            className="bg-[#f8faff] border border-[#dbe5ff] rounded-xl p-5 mb-5"
          >
            <h4 className="text-lg text-[#1a237e] mb-3 font-semibold">
              {i + 1}. {q.text}
            </h4>

            <div className="grid gap-3">
              {["A", "B", "C", "D"].map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center p-2.5 rounded-lg bg-white border cursor-pointer transition-all hover:bg-[#eef3ff] ${
                    answers[q.id] === opt
                      ? "border-[#4d90fe]"
                      : "border-[#d0d7ff]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => handleOptionChange(q.id, opt)}
                    className="mr-2 accent-[#4d90fe]"
                  />
                  <span>{q[`option_${opt.toLowerCase()}`]}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          className="w-full bg-[#4d90fe] text-white rounded-xl py-3 text-lg font-semibold hover:bg-[#1a73e8] active:scale-95"
          onClick={handleSubmit}
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
}

export default Start;
