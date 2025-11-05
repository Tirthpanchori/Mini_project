import { useState } from "react";
import api from "../../services/api";
import { CheckCircle } from "lucide-react"; // icon for visual tick ✅

function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [timer, setTimer] = useState(600); // default 10 minutes
  const [numQuestions, setNumQuestions] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [quizCode, setQuizCode] = useState("");
  const [message, setMessage] = useState("");
  const [isReady, setIsReady] = useState(false); // enable Create button when all Qs done

  // Step 1️⃣ — Handle initial question setup
  const handleQuestionSetup = () => {
    const qArray = Array.from({ length: numQuestions }, (_, i) => ({
      text: "",
      options: ["", "", "", ""],
      correct: 0, // index of correct option
    }));
    setQuestions(qArray);
    setIsReady(false);
  };

  // Step 2️⃣ — Handle per-question input
  const handleQuestionChange = (i, value) => {
    const updated = [...questions];
    updated[i].text = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qi, oi, value) => {
    const updated = [...questions];
    updated[qi].options[oi] = value;
    setQuestions(updated);
  };

  const handleCorrectChange = (qi, oi) => {
    const updated = [...questions];
    updated[qi].correct = oi;
    setQuestions(updated);
  };

  // Step 3️⃣ — Check all questions filled
  const checkCompletion = () => {
    const complete = questions.every(
      (q) =>
        q.text.trim() !== "" &&
        q.options.every((opt) => opt.trim() !== "")
    );
    setIsReady(complete);
  };

  // Step 4️⃣ — Submit the quiz
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setQuizCode("");

    try {
      const response = await api.post("/quiz/create/", {
        title,
        timer,
        questions, // later backend can handle storing them
      });

      setMessage(" Quiz created successfully!");
      setTitle("");
      setQuestions([]);
      setQuizCode(response.data.code);
    } catch (err) {
      setMessage(" Failed to create quiz: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  // Step 5️⃣ — Copy code
  const handleCopy = () => {
    navigator.clipboard.writeText(quizCode);
    setMessage("📋 Quiz code copied!");
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Create a New Quiz</h1>

      {/* Quiz Basic Info */}
      <div className="flex flex-col gap-4 mb-6">
        <input
          type="text"
          placeholder="Enter Quiz Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded p-2"
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
              max="50"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              className="border rounded p-2 w-full"
            />
          </div>
          <button
            onClick={handleQuestionSetup}
            className="bg-blue-500 text-white px-4 py-2 rounded self-end"
          >
            <CheckCircle className="inline mr-1 w-4 h-4" />
            Set
          </button>
        </div>
      </div>

      {/* Dynamic Questions */}
      {questions.length > 0 && (
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
                onBlur={checkCompletion}
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
                      onBlur={checkCompletion}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Button */}
      <button
        onClick={handleSubmit}
        disabled={!isReady || !title}
        className={`mt-8 w-full py-2 rounded text-white ${
          isReady && title ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Create Quiz
      </button>

      {/* Result */}
      {message && <p className="mt-4 text-center">{message}</p>}

      {quizCode && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50 text-center">
          <p className="text-lg font-semibold mb-2">Your Quiz Code:</p>
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
    </div>
  );
}

export default CreateQuiz;
