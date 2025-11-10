import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

function Start() {
  const { id } = useParams(); // quiz_id
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/attempts/${id}/questions/`);
        setQuiz(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to fetch quiz questions.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  // 👇 Function to handle radio button selection
  function handleOptionChange(questionId, selectedOption) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  }

  // 👇 Submit the answers to backend
  async function handleSubmit() {
    if (!quiz) return;

    const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
      question_id: parseInt(questionId),
      selected_option: selectedOption,
    }));

    if (formattedAnswers.length !== quiz.questions.length) {
      alert("Please answer all questions before submitting!");
      return;
    }

    try {
      const res = await api.post(`/attempts/save/`, {
        quiz_id: quiz.quiz_id,
        answers: formattedAnswers,
      });

      alert("Quiz submitted successfully!");
      console.log("Result:", res.data);

      navigate(`/result/${quiz.quiz_id}`, { state: res.data });
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert(err.response?.data?.detail || "Failed to submit quiz.");
    }
  }

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading quiz...</p>;

  if (error)
    return <p className="text-center mt-10 text-red-600 font-medium">{error}</p>;

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex justify-center p-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-8">
        <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">
          {quiz.title}
        </h2>
        <p className="text-center text-gray-600 mb-8 text-sm sm:text-base">
          ⏱ Timer: {quiz.timer} sec | Total Questions: {quiz.questions.length}
        </p>

        {/* Question List */}
        {quiz.questions.map((q, i) => (
          <div
            key={q.id}
            className="bg-[#f8faff] border border-[#dbe5ff] rounded-xl p-5 mb-5 shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
          >
            <h4 className="text-lg text-[#1a237e] mb-3 font-semibold">
              {i + 1}. {q.text}
            </h4>

            <div className="grid gap-3">
              {["A", "B", "C", "D"].map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center p-2.5 rounded-lg bg-white border cursor-pointer transition-all hover:bg-[#eef3ff] ${
                    answers[q.id] === opt ? "border-[#4d90fe]" : "border-[#d0d7ff]"
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
          className="w-full bg-[#4d90fe] text-white rounded-xl py-3 text-lg font-semibold cursor-pointer transition-all hover:bg-[#1a73e8] active:scale-95"
          onClick={handleSubmit}
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
}

export default Start;
