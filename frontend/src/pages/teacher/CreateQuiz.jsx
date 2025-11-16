import { useState } from "react";
import api from "../../services/api";

function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [timer, setTimer] = useState(600); 
  const [numQuestions, setNumQuestions] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [quizCode, setQuizCode] = useState("");
  const [message, setMessage] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [step, setStep] = useState(1);

  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [pdfFile, setPdfFile] = useState(null); // NEW
  const [isLoading, setIsLoading] = useState(false);

  // ---------------- CREATE QUIZ ----------------
  const handleCreateQuiz = async (e) => {
    if (e) e.preventDefault();
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

      const qArray = Array.from({ length: numQuestions }, () => ({
        text: "",
        options: ["", "", "", ""],
        correct: 0,
      }));
      setQuestions(qArray);
    } catch (err) {
      setMessage("❌ Failed to create quiz: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  // ---------------- QUESTION LOGIC ----------------
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

  // ---------------- ADD QUESTIONS ----------------
  const handleAddQuestions = async () => {
    setMessage("");
    if (!quizId) {
      setMessage("❌ Quiz ID not found. Please create the quiz first.");
      return;
    }

    const formattedQuestions = questions.map((q) => ({
      text: q.text,
      options: q.options,
      correct: q.correct,
    }));

    try {
      await api.post(`/quiz/${quizId}/add-questions/`, {
        questions: formattedQuestions,
      });

      setMessage("✅ Questions added successfully!");
      setStep(3);
    } catch (err) {
      setMessage("❌ Failed to add questions: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  // ---------------- COPY QUIZ CODE ----------------
  const handleCopy = () => {
    navigator.clipboard.writeText(quizCode);
    setMessage("📋 Quiz code copied!");
  };

  // ---------------- AI QUIZ GENERATION (PROMPT + PDF) ----------------
  const handleAIPromptSubmit = async () => {
    if (!aiPrompt.trim() && !pdfFile) {
      alert("⚠️ Please enter a prompt or upload a PDF!");
      return;
    }

    setShowAIModal(false);
    setIsLoading(true);
    setMessage("🤖 Generating quiz using AI... Please wait.");

    try {
      const formData = new FormData();
      formData.append("topic", aiPrompt || "");
      formData.append("num_questions", numQuestions);
      formData.append("difficulty", "medium");

      if (pdfFile) {
        formData.append("pdf", pdfFile);
      }

      const aiRes = await api.post("/ai/generate-quiz/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const aiData = aiRes.data.result?.questions || [];

      const res = await api.post("/quiz/create/", {
        title,
        timer,
        total_questions: aiData.length,
      });

      setQuizId(res.data.quiz_id);
      setQuizCode(res.data.code);
      setMessage("✅ AI Quiz created! You can edit questions below.");
      setStep(2);

      const formatted = aiData.map((q) => ({
        text: q.question,
        options: q.options,
        correct: q.answer,
      }));

      setQuestions(formatted);
      checkCompletion(formatted);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to generate quiz using AI: " + (err.response?.data?.detail || "Unknown error"));
    } finally {
      setIsLoading(false);
      setPdfFile(null); // reset PDF after submit
    }
  };

  // ---------------- UI ----------------

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="p-8 max-w-3xl w-full bg-white rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {step === 1 ? "Create a New Quiz" : step === 2 ? "Add Questions" : "Quiz Created 🎉"}
        </h1>

        {/* STEP 1 → CREATE QUIZ */}
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
                <label className="block text-sm mb-1">Timer (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={timer / 60}
                  onChange={(e) => setTimer(e.target.value * 60)}
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

            <div className="flex justify-between items-center gap-4 mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg min-w-[140px]"
              >
                {isLoading ? "Loading..." : "Create Quiz"}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!title.trim()) {
                    alert("⚠️ Please enter a quiz title first!");
                    return;
                  }
                  setShowAIModal(true);
                }}
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md hover:shadow-lg transition-all duration-500 min-w-[140px]"
              >
                Use AI
              </button>
            </div>
          </form>
        )}

        {/* STEP 2 → ADD QUESTIONS */}
        {step === 2 && (
          <div className="space-y-6">
            {questions.map((q, qi) => (
              <div key={qi} className="p-4 border rounded-lg">
                <label className="font-semibold">Question {qi + 1}</label>
                <input
                  type="text"
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
                        onChange={(e) => handleOptionChange(qi, oi, e.target.value)}
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
                isReady ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Save Questions
            </button>
          </div>
        )}

        {/* STEP 3 → SUCCESS */}
        {step === 3 && (
          <div className="text-center">
            <p className="text-lg font-semibold mb-2 text-green-600">🎉 Quiz successfully created!</p>
            <p className="text-gray-700 mb-4">Share this code with your students:</p>

            <div className="flex justify-center items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">{quizCode}</span>
              <button onClick={handleCopy} className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
                Copy
              </button>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-indigo-700"
                onClick={() => window.location.replace("/teacher")}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {message && <p className="mt-6 text-center">{message}</p>}

        {/* ---------------- AI MODAL (Prompt + Optional PDF) ---------------- */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4 text-center">Enter AI Prompt</h2>

              <textarea
                rows="3"
                placeholder="Enter topic or instructions..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full border rounded-lg p-3 mb-4"
              />

              {/* Optional PDF Upload */}
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="w-full border rounded-lg p-2 mb-2"
              />

              <p className="text-sm text-gray-500 mb-3">
                Upload a PDF (optional). Leave empty if not needed.
              </p>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowAIModal(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
                  Cancel
                </button>

                <button
                  onClick={handleAIPromptSubmit}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateQuiz;
