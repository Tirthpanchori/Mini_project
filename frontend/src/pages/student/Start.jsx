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

  // UI States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [markedForReview, setMarkedForReview] = useState(new Set()); // IDs of marked questions
  const [showPanel, setShowPanel] = useState(true); // Right panel toggle

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
    if (timeLeft === 0 && !timeUp) {
      setTimeUp(true);
      setTimeout(() => {
        submitQuizApi();
      }, 3000); // Show "Time's Up" message for 3 seconds before submitting
    }
  }, [timeLeft, timeUp]);

  // -----------------------------
  // Logic Handlers
  // -----------------------------
  function handleOptionChange(questionId, selectedOption) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  }

  function toggleMarkForReview(questionId) {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }

  async function submitQuizApi() {
    if (!quiz || isSubmitting) return;
    setIsSubmitting(true);

    localStorage.removeItem(`quiz_end_${id}`);

    const formattedAnswers = quiz.questions.map((q) => ({
      question_id: q.id,
      selected_option: answers[q.id] || null,
    }));

    const payload = {
      quiz_id: quiz.quiz_id,
      answers: formattedAnswers,
    };

    try {
      const res = await api.post(`/attempts/save/`, payload);
      navigate(`/result/${quiz.quiz_id}`, { state: res.data });
      localStorage.setItem("lastAttempt", JSON.stringify(res.data));
    } catch (err) {
      if (timeUp) {
        alert("Submission failed. Please contact support.");
      }
      alert(err.response?.data?.detail || "Failed to submit quiz.");
      setIsSubmitting(false); // Only reset if error
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(curr => curr + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(curr => curr - 1);
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const attemptSubmit = () => {
    setShowSubmitModal(true);
  };

  const getTimerColor = () => {
    if (timeLeft === null) return "text-blue-400";
    if (timeLeft < 30) return "text-red-500 animate-pulse";
    if (timeLeft < 120) return "text-orange-400";
    return "text-blue-400";
  };

  // -----------------------------
  // UI rendering
  // -----------------------------
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-red-400 font-medium text-lg bg-slate-800 px-6 py-4 rounded-xl border border-red-900/50 shadow">{error}</p>
      </div>
    );

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.size;

  return (
    <div className="h-screen flex flex-col bg-slate-900 font-sans text-slate-200 overflow-hidden">

      {/* 1. DARK STICKY HEADER */}
      <header className="flex-none h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 shadow-md z-30">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-1 ring-indigo-400/30">
            Q
          </div>
          <h1 className="text-lg font-bold text-slate-100 truncate max-w-xs md:max-w-md" title={quiz.title}>{quiz.title}</h1>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:block text-slate-400 font-medium">
            Question <span className="text-white font-bold">{currentQuestionIndex + 1}</span> / {totalQuestions}
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-700/50 ${getTimerColor()}`}>
            <span>⏰</span>
            <span className="font-mono font-bold text-xl tracking-widest">
              {timeLeft !== null
                ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
                : "--:--"}
            </span>
          </div>

          {/* Toggle Panel Button (Desktop) */}
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 transition-colors"
            title={showPanel ? "Hide Panel" : "Show Panel"}
          >
            {showPanel ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* 2. FLEX CONTAINER */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* LEFT PANEL: QUESTION AREA */}
        <main className={`flex-1 flex flex-col relative overflow-y-auto custom-scrollbar transition-all duration-500 ease-in-out`}>
          <div className={`w-full h-full flex flex-col p-6 md:p-10 ${!showPanel ? 'items-center' : ''}`}>

            {/* Content Container - varies max-width based on panel state */}
            <div className={`w-full transition-all duration-500 pb-20 space-y-8 ${!showPanel ? 'max-w-4xl' : 'max-w-3xl'} mx-auto`}>

              {/* Question Card */}
              <div className="bg-slate-800 rounded-2xl p-6 md:p-8 shadow-xl border border-slate-700/50 animate-fade-in">
                <div className="flex items-start gap-4 mb-6">
                  <span className="flex-shrink-0 w-8 h-8 rounded bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold border border-slate-600">
                    {currentQuestionIndex + 1}
                  </span>
                  <h2 className="text-xl md:text-2xl font-medium text-slate-100 leading-relaxed">
                    {currentQuestion.text}
                  </h2>
                </div>

                <div className="h-px w-full bg-slate-700/50 mb-6" />

                {/* Options */}
                <div className="grid gap-3">
                  {["A", "B", "C", "D"].map((opt) => {
                    const isSelected = answers[currentQuestion.id] === opt;
                    return (
                      <div
                        key={opt}
                        onClick={() => handleOptionChange(currentQuestion.id, opt)}
                        className={`
                                              group flex items-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                                              ${isSelected
                            ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-700"
                          }
                                          `}
                      >
                        <div className={`
                                              w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all flex-shrink-0
                                              ${isSelected
                            ? "border-indigo-500 bg-indigo-500 text-white"
                            : "border-slate-500 group-hover:border-slate-400"
                          }
                                          `}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                        <span className={`text-lg transition-colors ${isSelected ? "text-indigo-200 font-medium" : "text-slate-300"}`}>
                          {currentQuestion[`option_${opt.toLowerCase()}`]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Bar */}
              <div className="flex items-center justify-between gap-4 mt-8">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className={`
                                  flex-1 md:flex-none px-6 py-3 rounded-xl font-medium transition-all border
                                  ${currentQuestionIndex === 0
                      ? "border-transparent text-slate-600 cursor-not-allowed bg-slate-800/50"
                      : "border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                    }
                              `}
                >
                  ← Previous
                </button>

                <button
                  onClick={() => toggleMarkForReview(currentQuestion.id)}
                  className={`
                                  flex-1 md:flex-none px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border
                                  ${markedForReview.has(currentQuestion.id)
                      ? "border-yellow-600 bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/30"
                      : "border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                    }
                              `}
                >
                  {markedForReview.has(currentQuestion.id) ? "★ Marked" : "☆ Mark for Review"}
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className={`
                                  flex-1 md:flex-none px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-1
                                  ${currentQuestionIndex === totalQuestions - 1
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed hidden"
                      : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20"
                    }
                              `}
                >
                  Next →
                </button>
              </div>

            </div>
          </div>
        </main>

        {/* RIGHT PANEL: QUESTION PALETTE */}
        <aside className={`
              hidden lg:flex bg-slate-800 border-l border-slate-700 flex-col z-20 shadow-xl
              transition-all duration-500 ease-in-out whitespace-nowrap overflow-hidden
              ${showPanel ? 'w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-10'}
          `}>
          <div className="p-5 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between">
            <h3 className="text-slate-200 font-semibold text-lg flex items-center gap-2">
              <span className="opacity-70">▦</span> Question Palette
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
            <div className="grid grid-cols-4 gap-3">
              {quiz.questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isMarked = markedForReview.has(q.id);
                const isCurrent = idx === currentQuestionIndex;

                let baseClasses = "h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all border-2";

                // Determine visual state priority: Current gets Focus Ring. Colors are strictly defined.
                // States:
                // 1. Attempted & Marked -> Purple
                // 2. Marked -> Yellow
                // 3. Attempted -> Green
                // 4. Not Attempted -> Gray

                let colorClasses = "";

                if (isAnswered && isMarked) {
                  colorClasses = "border-purple-600/50 bg-purple-900/30 text-purple-300 hover:border-purple-500";
                } else if (isMarked) {
                  colorClasses = "border-yellow-600/50 bg-yellow-900/30 text-yellow-400 hover:border-yellow-500";
                } else if (isAnswered) {
                  colorClasses = "border-green-600/50 bg-green-900/30 text-green-400 hover:border-green-500";
                } else {
                  colorClasses = "border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500 hover:bg-slate-700 hover:text-slate-200";
                }

                if (isCurrent) {
                  // Add focus ring and scale, keep background color but ensure border is white
                  baseClasses += ` ${colorClasses} border-white ring-2 ring-indigo-500/50 scale-105 z-10`;
                } else {
                  baseClasses += ` ${colorClasses}`;
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(idx)}
                    className={baseClasses}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 space-y-3 px-2">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-4 h-4 rounded bg-green-900/30 border border-green-600/50"></div>
                <span>Attempted</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-4 h-4 rounded bg-yellow-900/30 border border-yellow-600/50"></div>
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-4 h-4 rounded bg-purple-900/30 border border-purple-600/50"></div>
                <span>Attempted & Marked</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-4 h-4 rounded bg-slate-700/50 border border-slate-600"></div>
                <span>Not Attempted</span>
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-slate-700 bg-slate-900/30">
            <button
              onClick={attemptSubmit}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Submit Quiz</span>
            </button>
          </div>
        </aside>
      </div>

      {/* MOBILE FLOATING ACTION (Only visible if palette is hidden or on mobile) */}
      <div className={`${showPanel ? 'lg:hidden' : 'lg:flex'} fixed bottom-0 left-0 w-full p-4 bg-slate-800 border-t border-slate-700 flex items-center justify-between z-40 transition-all`}>
        <div className="text-sm text-slate-400">
          <span className="text-green-400 font-bold">{answeredCount}</span> answered
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowPanel(true)}
            className="lg:hidden px-4 py-2 bg-slate-700 text-slate-300 rounded-lg font-medium border border-slate-600"
          >
            Palette
          </button>
          <button
            onClick={attemptSubmit}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow hover:bg-indigo-500"
          >
            Submit
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-700 animate-scale-up">
            <h3 className="text-2xl font-bold text-white mb-2">Submit Quiz?</h3>

            <div className="space-y-3 mb-6 text-slate-300">
              <p>You are about to submit your quiz.</p>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 text-center">
                  <div className="text-2xl font-bold text-white">{answeredCount}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Answered</div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 text-center">
                  <div className="text-2xl font-bold text-white">{totalQuestions}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Total</div>
                </div>
              </div>

              {(totalQuestions - answeredCount > 0 || markedCount > 0) && (
                <div className="bg-yellow-900/20 border border-yellow-700/30 p-3 rounded-lg text-sm text-yellow-200 mt-2">
                  {totalQuestions - answeredCount > 0 && <p>• <strong>{totalQuestions - answeredCount}</strong> questions left unanswered.</p>}
                  {markedCount > 0 && <p>• <strong>{markedCount}</strong> questions marked for review.</p>}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-5 py-2.5 rounded-lg text-slate-300 font-medium hover:bg-slate-700 transition-colors"
              >
                Review
              </button>
              <button
                onClick={submitQuizApi}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-bold shadow hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Submit Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIME'S UP OVERLAY */}
      {timeUp && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md text-white">
          <div className="text-6xl mb-6">⏳</div>
          <h2 className="text-4xl font-bold mb-4 text-white">Time's Up!</h2>
          <p className="text-xl text-slate-300 mb-8">Submitting your answers...</p>
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Global & Animation Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b; 
        }
        
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-up { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-up { animation: scale-up 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>

    </div>
  );
}

export default Start;
