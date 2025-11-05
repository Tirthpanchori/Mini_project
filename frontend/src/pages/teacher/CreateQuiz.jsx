import { useState } from "react";
import api from "../../services/api";
import { CheckCircle } from "lucide-react";

function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [timer, setTimer] = useState(600); // seconds
  const [numQuestions, setNumQuestions] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [quizCode, setQuizCode] = useState("");
  const [message, setMessage] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [step, setStep] = useState(1); // step 1: create quiz, step 2: add questions

  // ✅ Step 1 — Create the quiz shell
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/quiz/create/", {
        title,
        timer,
        total_questions: numQuestions,
      });

      setQuizId(res.data.quiz_id);
      setQuizCode(res.data.code);
      setMessage("✅ Quiz created! Now add questions below.");
      setStep(2);

      // Initialize question objects
      const qArray = Array.from({ length: numQuestions }, () => ({
        text: "",
        options: ["", "", "", ""],
        correct: 0,
      }));
      setQuestions(qArray);
    } catch (err) {
      setMessage(
        "❌ Failed to create quiz: " +
          (err.response?.data?.detail || "Unknown error")
      );
    }
  };

  // ✅ Step 2 — Handle questions
  const handleQuestionChange = (i, value) => {
    const updated = [...questions];
    updated[i].text = value;
    setQuestions(updated);
    checkCompletion(updated);
  };

  const handleOptionChange = (qi, oi, value) => {
    const updated = [...questions];
    updated[qi].options[oi] = value;
    setQuestions(updated);
    checkCompletion(updated);
  };

  const handleCorrectChange = (qi, oi) => {
    const updated = [...questions];
    updated[qi].correct = oi;
    setQuestions(updated);
    checkCompletion(updated);
  };

  const checkCompletion = (updatedQuestions = questions) => {
    const complete = updatedQuestions.every(
      (q) => q.text.trim() !== "" && q.options.every((opt) => opt.trim() !== "")
    );
    setIsReady(complete);
  };

  // ✅ Step 3 — Submit questions for that quiz
  const handleAddQuestions = async () => {
    setMessage("");

    if (!quizId) {
      setMessage("❌ Quiz ID not found. Please create the quiz first.");
      return;
    }

    const formattedQuestions = questions.map((q) => ({
      text: q.text,
      options: q.options, // ✅ array of strings
      correct: q.correct, // ✅ number (0 to 3)
    }));

    try {
      await api.post(`/quiz/${quizId}/add-questions/`, {
        questions: formattedQuestions,
      });

      setMessage("✅ Questions added successfully!");
      setStep(3); // optional: mark quiz creation complete
    } catch (err) {
      setMessage(
        "❌ Failed to add questions: " +
          (err.response?.data?.detail || "Unknown error")
      );
    }
  };

  // ✅ Copy code helper
  const handleCopy = () => {
    navigator.clipboard.writeText(quizCode);
    setMessage("📋 Quiz code copied!");
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {step === 1
          ? "Create a New Quiz"
          : step === 2
          ? "Add Questions"
          : "Quiz Created 🎉"}
      </h1>

      {/* STEP 1️⃣ — QUIZ BASIC INFO */}
      {step === 1 && (
        <form onSubmit={handleCreateQuiz} className="flex flex-col gap-4 mb-6">
          <input
            type="text"
            placeholder="Enter Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded p-2"
            required
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm mb-1">Timer (seconds)</label>
              <input
                type="number"
                min="60"
                value={timer}
                onChange={(e) => setTimer(e.target.value)}
                className="border rounded p-2 w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">Number of Questions</label>
              <input
                type="number"
                min="1"
                max="100"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="border rounded p-2 w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-2"
          >
            Create Quiz
          </button>
        </form>
      )}

      {/* STEP 2️⃣ — ADD QUESTIONS */}
      {step === 2 && (
        <div className="space-y-6">
          {questions.map((q, qi) => (
            <div key={qi} className="p-4 border rounded-lg">
              <label className="font-semibold">Question {qi + 1}</label>
              <input
                type="text"
                placeholder="Enter question text"
                value={q.text}
                onChange={(e) => handleQuestionChange(qi, e.target.value)}
                className="border rounded p-2 w-full mt-1 mb-2"
              />

              <div className="grid grid-cols-2 gap-3">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correct === oi}
                      onChange={() => handleCorrectChange(qi, oi)}
                    />
                    <input
                      type="text"
                      placeholder={`Option ${oi + 1}`}
                      value={opt}
                      onChange={(e) =>
                        handleOptionChange(qi, oi, e.target.value)
                      }
                      className="border rounded p-2 w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleAddQuestions}
            disabled={!isReady}
            className={`w-full py-2 rounded text-white ${
              isReady
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Save Questions
          </button>
        </div>
      )}

      {/* ✅ SUCCESS STEP */}
      {step === 3 && (
        <div className="text-center">
          <p className="text-lg font-semibold mb-2 text-green-600">
            🎉 Quiz successfully created!
          </p>
          <p className="text-gray-700 mb-4">
            Share this code with your students:
          </p>
          <div className="flex justify-center items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">{quizCode}</span>
            <button
              onClick={handleCopy}
              className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {message && <p className="mt-6 text-center">{message}</p>}
    </div>
  );
}

export default CreateQuiz;
