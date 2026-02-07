import { useState } from "react";
import api from "../../services/api";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  FileText,
  HelpCircle,
  Layout,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
  ArrowLeft,
  Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [timer, setTimer] = useState(600);
  const [numQuestions, setNumQuestions] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [quizCode, setQuizCode] = useState("");
  const [message, setMessage] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [step, setStep] = useState(1);

  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(0);

  // ---------------- CREATE QUIZ (STEP 1) ----------------
  const handleCreateQuiz = (e) => {
    if (e) e.preventDefault();
    setMessage("");

    // Defer API call - just update local state
    setStep(2);

    const qArray = Array.from({ length: numQuestions }, () => ({
      text: "",
      options: ["", "", "", ""],
      correct: 0,
    }));
    setQuestions(qArray);
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

  // ---------------- ADD QUESTIONS (STEP 2) ----------------
  const handleAddQuestions = async () => {
    setMessage("");

    let currentQuizId = quizId;
    let currentQuizCode = quizCode;

    try {
        // 1. Create quiz if it doesn't exist yet
        if (!currentQuizId) {
            const createRes = await api.post("/quiz/create/", {
                title,
                timer,
                total_questions: questions.length, // Use actual length of questions array
            });

            currentQuizId = createRes.data.quiz_id;
            currentQuizCode = createRes.data.code;

            setQuizId(currentQuizId);
            setQuizCode(currentQuizCode);
        }

        // 2. Then, add the questions to the quiz
        const formattedQuestions = questions.map((q) => ({
            text: q.text,
            options: q.options,
            correct: q.correct,
        }));

        await api.post(`/quiz/${currentQuizId}/add-questions/`, {
            questions: formattedQuestions,
        });

        setMessage("✅ Quiz created successfully!");
        setStep(3);
    } catch (err) {
        console.error(err);
        setMessage("❌ Failed to save quiz: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  // ---------------- COPY QUIZ CODE ----------------
  const handleCopy = () => {
    navigator.clipboard.writeText(quizCode);
    setMessage("📋 Quiz code copied!");
  };

  // ---------------- AI QUIZ GENERATION ----------------
  const handleAIPromptSubmit = async () => {
    if (!aiPrompt.trim() && !pdfFile && !youtubeUrl.trim()) {
      alert("⚠️ Please provide a Prompt, PDF, or YouTube URL!");
      return;
    }

    setShowAIModal(false);
    setIsLoading(true);

    try {
      let finalTopic = aiPrompt || "";

      // 1. If YouTube URL is present, extract text first
      if (youtubeUrl.trim()) {
        setMessage("⏳ Extracting text from YouTube...");
        
        try {
          const ytRes = await api.post("/ai/get-text-outofurl/", { 
            url: youtubeUrl 
          });
          
          if (ytRes.data.text) {
             // Append transcript to the topic
             finalTopic += "\n\nYouTube Video Transcript:\n" + ytRes.data.text;
          }
        } catch (ytErr) {
           console.error("YouTube extraction failed", ytErr);
           // We continue anyway? Or fail? The user expects the video to be used.
           // Better to fail and let them know.
           throw new Error("Failed to extract text from YouTube video. Please check the URL.");
        }
      }

      setMessage("🤖 Generating quiz using AI... Please wait.");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("topic", finalTopic);
      formData.append("num_questions", numQuestions);
      formData.append("difficulty", "medium");

      if (pdfFile) {
        formData.append("pdf", pdfFile);
      }
      
      // We don't need to send youtube_url to generate-quiz anymore since we sent the text
      // but if the backend logs it or something, we can send it. 
      // Based on view checks, it ignores it, so omitting it is fine.

      const aiRes = await api.post("/ai/generate-quiz/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const aiData = aiRes.data.result?.questions || [];

      // Only update local state with AI results, do NOT create quiz yet
      const formatted = aiData.map((q) => ({
        text: q.question,
        options: q.options,
        correct: q.answer,
      }));

      setQuestions(formatted);
      // Update numQuestions to match what AI returned, so the UI is consistent
      setNumQuestions(formatted.length); 
      checkCompletion(formatted);
      
      setMessage("✅ AI Quiz generated! Review questions below.");
      setStep(2);

    } catch (err) {
      console.error(err);
      setMessage("❌ Error: " + (err.message || err.response?.data?.detail || "Unknown error"));
    } finally {
      setIsLoading(false);
      setPdfFile(null);
      setYoutubeUrl("");
    }
  };

  const toggleAccordion = (index) => {
    setExpandedQuestion(expandedQuestion === index ? -1 : index);
  };

  const steps = [
    { id: 1, label: "Details" },
    { id: 2, label: "Questions" },
    { id: 3, label: "Share" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 md:px-6 font-sans text-slate-200">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Progress Stepper */}
        <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-6 flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-800 -z-0" />
          {steps.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= s.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/20"
                  : "bg-slate-800 text-slate-500 border-2 border-slate-700"
                  }`}
              >
                {step > s.id ? <CheckCircle2 size={18} /> : s.id}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${step >= s.id ? "text-indigo-400" : "text-slate-600"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* STEP 1: QUIZ DETAILS */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Form Column */}
            <div className="bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-800 h-fit">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create New Quiz</h2>
              </div>

              <form onSubmit={handleCreateQuiz} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Quiz Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Advanced Mathematics Final"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 outline-none transition-all placeholder:text-slate-600 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">
                      Duration (mins)
                    </label>

                    <div className="flex items-center border border-slate-800 rounded-xl overflow-hidden h-[50px] bg-slate-950">
                      {/* - button */}
                      <button
                        type="button"
                        onClick={() => setTimer((prev) => Math.max(60, prev - 60))}
                        className="w-12 h-full hover:bg-slate-800 border-r border-slate-800 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
                      >
                        <Minus size={16} />
                      </button>

                      {/* input */}
                      <input
                        type="number"
                        min="1"
                        value={timer / 60}
                        onChange={(e) => setTimer(Math.max(1, Number(e.target.value || 1)) * 60)}
                        className="w-full text-center h-full bg-transparent outline-none font-medium text-slate-200
                 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />

                      {/* + button */}
                      <button
                        type="button"
                        onClick={() => setTimer((prev) => Math.min(6000, prev + 60))}
                        className="w-12 h-full hover:bg-slate-800 border-l border-slate-800 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">Total Questions</label>
                    <div className="flex items-center border border-slate-800 rounded-xl overflow-hidden h-[50px] bg-slate-950">
                      <button type="button" onClick={() => setNumQuestions(Math.max(1, numQuestions - 1))} className="w-12 h-full hover:bg-slate-800 border-r border-slate-800 text-slate-400 hover:text-white transition-colors flex items-center justify-center">
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                        className="w-full text-center h-full bg-transparent outline-none font-medium appearance-none m-0 text-slate-200"
                        style={{ MozAppearance: 'textfield' }}
                      />
                      <style jsx>{`
                                input[type=number]::-webkit-inner-spin-button, 
                                input[type=number]::-webkit-outer-spin-button { 
                                  -webkit-appearance: none; 
                                  margin: 0; 
                                }
                             `}</style>
                      <button type="button" onClick={() => setNumQuestions(Math.min(100, numQuestions + 1))} className="w-12 h-full hover:bg-slate-800 border-l border-slate-800 text-slate-400 hover:text-white transition-colors flex items-center justify-center">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? "Creating..." : <>Create Quiz <ChevronRight size={18} /></>}
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
                    className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold border border-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={18} /> Generate with AI
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Column */}
            <div className="hidden md:flex flex-col gap-4">
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-center border border-slate-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/10 blur-[60px] rounded-full pointer-events-none" />

                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-slate-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-700">
                    <Layout className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2 break-words text-white">{title || "Your Quiz Title"}</h3>
                  <p className="text-slate-400 mb-8">Preview of your quiz card</p>

                  <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                    <div className="bg-slate-950/50 backdrop-blur-md rounded-xl p-4 border border-slate-800">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                      <p className="font-bold text-lg text-white">{timer / 60}m</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Duration</p>
                    </div>
                    <div className="bg-slate-950/50 backdrop-blur-md rounded-xl p-4 border border-slate-800">
                      <HelpCircle className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                      <p className="font-bold text-lg text-white">{numQuestions}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Questions</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-800 text-sm text-slate-500 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Code generated automatically
                  </div>
                </div>
              </div>

              {/* Just Added: Go to Dashboard Button */}
              <button
                onClick={() => window.location.href = '/teacher'}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />Go to Dashboard
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: ADD QUESTIONS */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 bg-slate-950/30 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="text-slate-500 hover:text-white transition-colors"
                      title="Go Back"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-white">Edit Questions</h2>
                  </div>
                  <p className="text-slate-500 text-sm mt-1 pl-8">Fill in details for {questions.length} questions.</p>
                </div>
                <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-500/20">
                  {questions.length} Items
                </span>
              </div>

              <div className="divide-y divide-slate-800">
                {questions.map((q, qi) => (
                  <div key={qi} className={`transition-all ${expandedQuestion === qi ? 'bg-slate-800/50' : 'bg-transparent'}`}>
                    <button
                      onClick={() => toggleAccordion(qi)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/30 transition-colors"
                    >
                      <span className="font-semibold text-slate-300 flex items-center gap-3">
                        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${q.text ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                          {qi + 1}
                        </span>
                        {q.text || <span className="text-slate-500 italic font-normal">Enter question text...</span>}
                      </span>
                      {expandedQuestion === qi ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
                    </button>

                    <AnimatePresence>
                      {expandedQuestion === qi && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-5 pt-0 space-y-4">
                            <input
                              type="text"
                              placeholder="Type your question here..."
                              value={q.text}
                              onChange={(e) => handleQuestionChange(qi, e.target.value)}
                              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 outline-none transition-all font-medium placeholder:text-slate-600"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {q.options.map((opt, oi) => (
                                <div
                                  key={oi}
                                  className={`relative group rounded-xl border transition-all ${q.correct === oi
                                    ? "border-emerald-500/50 bg-emerald-500/10"
                                    : "border-slate-800 bg-slate-950 hover:border-slate-700"
                                    }`}
                                >
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                                    <input
                                      type="radio"
                                      name={`correct-${qi}`}
                                      checked={q.correct === oi}
                                      onChange={() => handleCorrectChange(qi, oi)}
                                      className="w-4 h-4 text-emerald-500 focus:ring-emerald-500/50 bg-slate-800 border-slate-600 cursor-pointer"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    placeholder={`Option ${oi + 1}`}
                                    value={opt}
                                    onChange={(e) => handleOptionChange(qi, oi, e.target.value)}
                                    className="w-full py-3 px-4 pl-10 bg-transparent border-none outline-none focus:ring-0 text-slate-300 placeholder:text-slate-600"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-slate-900 border-t border-slate-800">
                <button
                  onClick={handleAddQuestions}
                  disabled={!isReady}
                  className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Save Questions & Finish <CheckCircle2 size={20} />
                </button>
                {!isReady && (
                  <p className="text-center text-xs text-rose-400 font-medium mt-3">
                    * Please fill in all questions and options to proceed
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-800 text-center relative">
              <div className="bg-emerald-500 h-2 w-full" />

              <div className="p-10">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <Sparkles className="w-10 h-10 text-emerald-400" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">Quiz Published! 🎉</h2>
                <p className="text-slate-400 mb-8">Your quiz is ready. Share the code beneath with your students to let them join.</p>

                <div className="bg-slate-950 rounded-2xl p-6 mb-8 relative group border border-slate-800">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Quiz Code</p>
                  <div className="text-4xl font-mono font-bold text-white tracking-wider flex items-center justify-center gap-4">
                    {quizCode}
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      title="Copy Code"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="py-3 rounded-xl border border-slate-700 font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} /> Review Questions
                  </button>
                  <button
                    onClick={() => window.location.replace("/teacher")}
                    className="py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 border border-slate-700"
          >
            {message.includes("❌") ? <X className="text-rose-400" /> : <CheckCircle2 className="text-emerald-400" />}
            <p className="font-medium">{message}</p>
          </motion.div>
        )}

        {/* AI MODAL */}
        <AnimatePresence>
          {showAIModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 rounded-3xl p-8 shadow-2xl max-w-lg w-full relative overflow-hidden border border-slate-800"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500" />

                <h2 className="text-2xl font-bold text-white mb-2">Generate with AI ✨</h2>
                <p className="text-slate-400 mb-6">Describe your quiz topic and let our AI build it for you.</p>

                <div className="space-y-6 mb-8">
                  {/* OPTION 1: PROMPT + PDF */}
                  <div
                    className={`transition-all duration-300 ${youtubeUrl.trim() ? "opacity-40 grayscale pointer-events-none" : "opacity-100"}`}
                  >
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-slate-400 mb-2">Prompt / Topic</label>
                      <textarea
                        rows="4"
                        placeholder="e.g. Create a hard quiz about Organic Chemistry covering Alkanes and Alkenes..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        disabled={!!youtubeUrl.trim()}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none text-slate-200 placeholder:text-slate-600 disabled:cursor-not-allowed"
                      />
                      <div className="flex flex-wrap gap-2 mt-3">
                        {["Python OOP", "World History", "Calculus Limits", "Biology"].map(tag => (
                          <button
                            key={tag}
                            onClick={() => !youtubeUrl.trim() && setAiPrompt(tag)}
                            disabled={!!youtubeUrl.trim()}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-3 py-1.5 rounded-full font-medium transition-colors border border-slate-700 disabled:cursor-not-allowed disabled:hover:bg-slate-800"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-2">Upload Reference PDF (Optional)</label>
                      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-800 rounded-xl transition-colors group ${youtubeUrl.trim() ? "cursor-not-allowed" : "cursor-pointer hover:bg-slate-950 hover:border-indigo-500/50"}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-slate-600 group-hover:text-indigo-400 mb-2 transition-colors" />
                          <p className="text-sm text-slate-500">{pdfFile ? pdfFile.name : "Click to upload PDF"}</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="application/pdf"
                          onChange={(e) => setPdfFile(e.target.files[0])}
                          disabled={!!youtubeUrl.trim()}
                        />
                      </label>
                    </div>
                  </div>

                  {/* DIVIDER */}
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-500 text-sm font-semibold uppercase tracking-wider">OR</span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  {/* OPTION 2: YOUTUBE URL */}
                  <div
                    className={`transition-all duration-300 ${(aiPrompt.trim() || pdfFile) ? "opacity-40 grayscale pointer-events-none" : "opacity-100"}`}
                  >
                    <label className="block text-sm font-semibold text-slate-400 mb-2">YouTube Video URL</label>
                    <div className="relative">

                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        disabled={!!(aiPrompt.trim() || pdfFile)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-12 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-200 placeholder:text-slate-600 disabled:cursor-not-allowed"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500/50 pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Validation Note */}
                  {((aiPrompt.trim() || pdfFile) && youtubeUrl.trim()) && (
                    <p className="text-xs text-rose-400 text-center animate-pulse">
                      Please clear one option to use the other.
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowAIModal(false)}
                    className="px-6 py-2.5 rounded-xl text-slate-400 font-bold hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAIPromptSubmit}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
                  >
                    Generate Quiz
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CreateQuiz;