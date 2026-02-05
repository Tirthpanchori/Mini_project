import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Mail,
  Award,
  AlertTriangle,
  Lightbulb,
  Target,
  BookOpen,
  BarChart2,
  List,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: attemptId } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI/Pro UI States
  const [showAnalysis, setShowAnalysis] = useState(false); // false = Detailed, true = AI
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState({});

  const fmtPercent = (n) => {
    if (typeof n !== "number") return "-";
    return `${n.toFixed(0)}%`;
  };

  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1. Try location state (fresh from quiz)
      if (location.state) {
        setResult(location.state);
        try {
          localStorage.setItem("lastAttempt", JSON.stringify(location.state));
        } catch (e) { }
        setLoading(false);
        return;
      }

      // 2. Try Backend if ID exists
      if (attemptId) {
        try {
          const res = await api.get(`/attempts/result/${attemptId}/`);
          setResult(res.data);
          try {
            localStorage.setItem("lastAttempt", JSON.stringify(res.data));
          } catch (e) { }
        } catch (err) {
          console.error("Failed to fetch result:", err);
          setResult(null);
        } finally {
          setLoading(false);
        }
        return;
      }

      // 3. Fallback to localStorage
      try {
        const saved = localStorage.getItem("lastAttempt");
        if (saved) setResult(JSON.parse(saved));
        else setResult(null);
      } catch (e) {
        setResult(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [attemptId, location.state]);

  // AI Analysis Effect
  useEffect(() => {
    if (showAnalysis && !aiAnalysis && !loadingAnalysis) {
      fetchAiAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAnalysis]);

  const fetchAiAnalysis = async () => {
    if (!result || !result.results) {
      setAnalysisError("No quiz data available for analysis.");
      return;
    }

    setLoadingAnalysis(true);
    setAnalysisError(null);

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        "http://127.0.0.1:8000/api/ai/analyze-weak-topics/",
        { quiz_results: result.results },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.data && (response.data.success || Object.keys(response.data).length)) {
        setAiAnalysis(response.data);
      } else {
        setAnalysisError(response.data?.error || "Analysis failed.");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisError("Failed to analyze topics. Please try again.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const toggleTopic = (idx) => {
    setExpandedTopics(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "border-rose-500/50 bg-rose-500/5 text-rose-400";
      case "high": return "border-orange-500/50 bg-orange-500/5 text-orange-400";
      case "moderate": return "border-amber-500/50 bg-amber-500/5 text-amber-400";
      default: return "border-slate-700 bg-slate-800 text-slate-400";
    }
  };

  const getQuestionStatus = (q) => {
    // Logic: If 'selected_option' is missing/null, it is UNATTEMPTED.
    // Otherwise, fallback to q.is_correct check.
    if (!q.selected_option) return "unattempted";
    return q.is_correct ? "correct" : "wrong";
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Loading Result...</p>
      </div>
    </div>
  );

  if (!result) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-rose-400 mb-4">No result data found.</p>
        <button onClick={() => navigate('/student')} className="px-5 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors">
          Go Back to Dashboard
        </button>
      </div>
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
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30 p-6 md:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Navigation */}
        <button
          onClick={() => navigate('/recent-quizzes')}
          className="text-slate-500 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to Recent Attempts
        </button>

        {/* Summary Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{quiz_title || "Quiz Result"}</h1>
                <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-bold">
                  Completed
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-400 text-sm">
                {/* Only show student details if available, otherwise just date */}
                {student_name && (
                  <span className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold border border-slate-700">
                      {student_name.charAt(0).toUpperCase()}
                    </div>
                    {student_name}
                  </span>
                )}
                {attempted_at && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} /> {new Date(attempted_at).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <div className="text-center">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Score</p>
                <p className={`text-3xl font-bold ${score >= 60 ? "text-emerald-400" : "text-rose-400"}`}>
                  {typeof score === "number" ? fmtPercent(score) : score ?? "-"}
                </p>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div className="text-center">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Correct</p>
                <p className="text-xl font-bold text-white">
                  {correct_answers} <span className="text-slate-500 text-sm font-normal">/ {total_questions}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md mx-auto md:mx-0">
          <button
            onClick={() => setShowAnalysis(false)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${!showAnalysis
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
          >
            <List size={16} /> Detailed Review
          </button>
          <button
            onClick={() => setShowAnalysis(true)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${showAnalysis
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
          >
            <Sparkles size={16} /> AI Insights
          </button>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {!showAnalysis ? (
            <motion.div
              key="detailed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {results && results.length > 0 ? (
                results.map((q, i) => {
                  const status = getQuestionStatus(q);

                  return (
                    <div
                      key={q.question_id ?? i}
                      className="group bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all"
                    >
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <h4 className="text-lg font-medium text-white">
                          <span className="text-slate-500 mr-2">{i + 1}.</span> {q.question_text}
                        </h4>

                        {/* Status Badge */}
                        <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${status === "correct"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : status === "unattempted"
                              ? "bg-slate-700/30 text-slate-400 border-slate-600/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}>
                          {status === "correct" && <CheckCircle2 size={12} />}
                          {status === "wrong" && <XCircle size={12} />}
                          {status === "unattempted" && <HelpCircle size={12} />}

                          {status === "correct" && "Correct"}
                          {status === "wrong" && "Wrong"}
                          {status === "unattempted" && "Not Attempted"}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        {/* Your Answer Box */}
                        <div className={`p-3 rounded-lg border ${status === "correct"
                            ? "bg-emerald-500/5 border-emerald-500/10"
                            : status === "unattempted"
                              ? "bg-slate-800/50 border-slate-700/50"
                              : "bg-rose-500/5 border-rose-500/10"
                          }`}>
                          <p className="text-slate-500 text-xs mb-1">Your Answer</p>
                          <p className={`font-medium ${status === "correct" ? "text-emerald-300" :
                              status === "unattempted" ? "text-slate-400 italic" : "text-rose-300"
                            }`}>
                            {status === "unattempted" ? "Not Attempted" : (q.selected_option_text ?? q.selected_option ?? "—")}
                          </p>
                        </div>

                        {/* Correct Answer Box */}
                        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/50">
                          <p className="text-slate-500 text-xs mb-1">Correct Answer</p>
                          <p className="text-emerald-400 font-medium">
                            {q.correct_option_text ?? q.correct_option ?? "—"}
                          </p>
                        </div>
                      </div>

                      {q.explanation && (
                        <div className="mt-3 flex items-start gap-2 text-sm text-slate-400 bg-slate-950/30 p-3 rounded-lg">
                          <Lightbulb size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-500">
                  No detailed question data available.
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="ai-analysis"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {loadingAnalysis && (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-violet-500/30 border-t-violet-500 mb-4" />
                  <p className="text-slate-300 font-medium">Analyzing Performance...</p>
                  <p className="text-slate-500 text-sm mt-1">Our AI is identifying weak topics and patterns.</p>
                </div>
              )}

              {analysisError && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 text-center">
                  <AlertTriangle className="mx-auto text-rose-400 mb-2" size={32} />
                  <p className="text-rose-300 font-medium mb-4">{analysisError}</p>
                  <button onClick={fetchAiAnalysis} className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-sm font-medium transition-colors">
                    Try Again
                  </button>
                </div>
              )}

              {aiAnalysis && !loadingAnalysis && (
                <>
                  {/* Summary Section */}
                  <div className="bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 rounded-2xl p-6 md:p-8">
                    <h3 className="text-xl font-bold text-violet-300 mb-4 flex items-center gap-2">
                      <Brain className="text-violet-400" /> Performance Summary
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-lg mb-6">
                      {aiAnalysis.overall_analysis}
                    </p>

                    {aiAnalysis.total_incorrect === 0 && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                        <Award className="text-emerald-400" size={24} />
                        <div>
                          <h4 className="font-bold text-emerald-400">Perfect Score!</h4>
                          <p className="text-sm text-emerald-300/80">Excellent work! You mastered this quiz.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Weak Topics Accordion */}
                  {aiAnalysis.weak_topics?.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Target className="text-rose-400" /> Improvement Areas
                      </h3>
                      {aiAnalysis.weak_topics.map((topic, idx) => (
                        <div
                          key={idx}
                          className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${getSeverityColor(topic.severity)}`}
                        >
                          <button
                            onClick={() => toggleTopic(idx)}
                            className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{topic.severity === 'critical' ? '🔴' : topic.severity === 'high' ? '🟠' : '🟡'}</span>
                              <div>
                                <h4 className="font-bold text-lg text-slate-200">{topic.topic}</h4>
                                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{topic.severity} Priority</p>
                              </div>
                            </div>
                            {expandedTopics[idx] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>

                          <AnimatePresence>
                            {expandedTopics[idx] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-white/5 bg-slate-950/30"
                              >
                                <div className="p-5 space-y-4 text-sm text-slate-300">
                                  <div>
                                    <p className="font-semibold text-slate-400 mb-1">Analysis:</p>
                                    <p>{topic.description}</p>
                                  </div>
                                  {topic.common_misconception && (
                                    <div className="bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                                      <p className="font-semibold text-rose-400 mb-1 flex items-center gap-2">
                                        <AlertTriangle size={14} /> Common Misconception:
                                      </p>
                                      <p>{topic.common_misconception}</p>
                                    </div>
                                  )}
                                  {topic.study_recommendations && (
                                    <div>
                                      <p className="font-semibold text-slate-400 mb-2">Recommendations:</p>
                                      <ul className="space-y-2 list-disc list-inside text-slate-300">
                                        {topic.study_recommendations.map((rec, i) => (
                                          <li key={i}>{rec}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Plan */}
                  {aiAnalysis.priority_actions?.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <List className="text-violet-400" /> Action Plan
                      </h3>
                      <div className="grid gap-3">
                        {aiAnalysis.priority_actions.map((action, i) => (
                          <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white">
                              {i + 1}
                            </div>
                            <p className="text-slate-300 mt-1">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center pt-4">
                    <button
                      onClick={fetchAiAnalysis}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                      <RefreshCw size={14} /> Refresh Analysis
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="flex justify-center pt-8">
          <button
            onClick={() => navigate('/student')}
            className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
          >
            Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

export default ResultPage;
