// src/pages/ResultPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import api from "../../services/api"; // your axios instance (baseURL, interceptors etc.)

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: attemptId } = useParams(); // route param optional
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // NLP / AI analysis states
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Helper: safe numeric formatting
  const fmtPercent = (n) => {
    if (typeof n !== "number") return "-";
    return `${n.toFixed(2)}%`;
  };

  // Load result: prefer location.state (fresh), then attemptId from backend, then localStorage fallback
  useEffect(() => {
    async function load() {
      setLoading(true);

      // If we have fresh state (just finished a quiz)
      if (location.state) {
        setResult(location.state);
        try {
          localStorage.setItem("lastAttempt", JSON.stringify(location.state));
        } catch (e) {
          console.warn("Could not save lastAttempt to localStorage", e);
        }
        setLoading(false);
        return;
      }

      // If route provides attemptId -> fetch from backend
      if (attemptId) {
        await fetchResultFromBackend(attemptId);
        return;
      }

      // fallback: try localStorage
      try {
        const saved = localStorage.getItem("lastAttempt");
        if (saved) {
          setResult(JSON.parse(saved));
        } else {
          setResult(null);
        }
      } catch (e) {
        console.warn("Failed to read lastAttempt from localStorage", e);
        setResult(null);
      } finally {
        setLoading(false);
      }
    }

    load();
    // only run when attemptId or location.state changes
  }, [attemptId, location.state]);

  // Fetch attempt result from backend
  const fetchResultFromBackend = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/attempts/result/${id}/`);
      // expecting the JSON shape you confirmed:
      // { attempt_id, quiz_title, score, correct_answers, total_questions, results: [...] }
      setResult(res.data);
      try {
        localStorage.setItem("lastAttempt", JSON.stringify(res.data));
      } catch (e) {
        console.warn("Could not save backend result to localStorage", e);
      }
    } catch (err) {
      console.error("Failed to fetch result:", err);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // AI analysis: fetch when user opens analysis tab
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
      // get token if you need to authorize AI endpoint
      const token = localStorage.getItem("access_token");
      // If your AI API is under same backend and api instance supports posting to that path,
      // you can use `api.post('/ai/analyze-weak-topics/', ...)` instead.
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

      // Expect response to be structured with helpful fields (as in your NLP version)
      if (
        response.data &&
        (response.data.success || Object.keys(response.data).length)
      ) {
        setAiAnalysis(response.data);
      } else {
        setAnalysisError(
          response.data?.error || "Analysis failed or returned empty response."
        );
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisError(
        error.response?.data?.error ||
          error.message ||
          "Failed to analyze topics. Please try again."
      );
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // small UI helpers for NLP presentation
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "text-red-700 bg-red-100 border-red-300";
      case "high":
        return "text-orange-700 bg-orange-100 border-orange-300";
      case "moderate":
        return "text-yellow-700 bg-yellow-100 border-yellow-300";
      default:
        return "text-gray-700 bg-gray-100 border-gray-300";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return "🔴";
      case "high":
        return "🟠";
      case "moderate":
        return "🟡";
      default:
        return "⚪";
    }
  };

  const getErrorPatternBadge = (pattern) => {
    const patterns = {
      partial_understanding: {
        icon: "🎯",
        label: "Partial Understanding",
        color: "bg-blue-100 text-blue-800",
      },
      confused_concepts: {
        icon: "🔄",
        label: "Confused Concepts",
        color: "bg-purple-100 text-purple-800",
      },
      fundamental_gap: {
        icon: "📚",
        label: "Fundamental Gap",
        color: "bg-red-100 text-red-800",
      },
    };
    return patterns[pattern] || patterns.fundamental_gap;
  };

  // Render states
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading result...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center mt-10">
        <p className="text-gray-600 mb-4">No result data found.</p>
        <div className="space-x-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate("/quiz/new")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Take a Quiz
          </button>
        </div>
      </div>
    );
  }

  // destructure safely
  const {
    quiz_title,
    score = null,
    correct_answers = 0,
    total_questions = 0,
    results = [],
  } = result;

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex justify-center p-10">
      <div className="w-full max-w-4xl space-y-6">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-center text-3xl font-bold text-gray-800 mb-4">
            {quiz_title || "Quiz Result"}
          </h2>

          <div className="text-center mb-6">
            <p className="text-lg text-gray-700">
              Score:{" "}
              <span className="font-bold text-blue-600">
                {typeof score === "number" ? fmtPercent(score) : score ?? "-"}
              </span>
            </p>
            <p className="text-gray-600">
              {correct_answers} / {total_questions} correct
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex gap-4 mb-6 justify-center">
            <button
              onClick={() => setShowAnalysis(false)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                !showAnalysis
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Detailed Review
            </button>
            <button
              onClick={() => setShowAnalysis(true)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                showAnalysis
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🧠 AI Analysis with NLP
            </button>
          </div>

          {/* Conditional Rendering */}
          {!showAnalysis ? (
            // Detailed Review
            <>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Detailed Review
              </h3>
              <div className="space-y-4">
                {results && results.length > 0 ? (
                  results.map((q, i) => (
                    <div
                      key={q.question_id ?? i}
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
                          {q.selected_option_text ?? q.selected_option ?? "—"}
                        </span>
                      </p>
                      <p>
                        Correct Answer:{" "}
                        <span className="font-semibold text-green-700">
                          {q.correct_option_text ?? q.correct_option ?? "—"}
                        </span>
                      </p>
                      {q.explanation && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          💡 {q.explanation}
                        </p>
                      )}
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
                  ))
                ) : (
                  <p className="text-gray-600">
                    No question-level data available.
                  </p>
                )}
              </div>
            </>
          ) : (
            // AI-Powered Weak Topics Analysis with NLP
            <div className="space-y-6">
              {loadingAnalysis && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">
                    Analyzing your performance with AI & NLP...
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Extracting key concepts, identifying patterns, and
                    clustering topics...
                  </p>
                </div>
              )}

              {analysisError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <span>⚠️</span> Analysis Error
                  </h3>
                  <p className="text-red-700 mb-4">{analysisError}</p>
                  <button
                    onClick={fetchAiAnalysis}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {aiAnalysis && !loadingAnalysis && (
                <>
                  {aiAnalysis.total_incorrect === 0 ? (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-8 text-center">
                      <div className="text-6xl mb-4">🎉</div>
                      <h3 className="text-2xl font-bold text-green-800 mb-2">
                        Perfect Score!
                      </h3>
                      <p className="text-green-700 text-lg mb-4">
                        {aiAnalysis.overall_analysis}
                      </p>
                      <div className="bg-white rounded-lg p-4 mt-4">
                        <p className="font-semibold text-gray-800 mb-2">
                          💪 Next Steps:
                        </p>
                        <ul className="space-y-1 text-gray-700">
                          {aiAnalysis.priority_actions?.map((action, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-600">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* NLP metadata card */}
                      {aiAnalysis.nlp_metadata && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                            <span>🧠</span> NLP-Powered Insights
                          </h3>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-white rounded-lg p-4">
                              <p className="font-semibold text-gray-800 mb-2 text-sm">
                                🔍 Key Concepts Detected:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {(aiAnalysis.nlp_metadata.top_concepts || [])
                                  .slice(0, 6)
                                  .map((concept, i) => (
                                    <span
                                      key={i}
                                      className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium"
                                    >
                                      {concept}
                                    </span>
                                  ))}
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-4">
                              <p className="font-semibold text-gray-800 mb-2 text-sm">
                                📊 Your Learning Pattern:
                              </p>
                              {(() => {
                                const pattern = getErrorPatternBadge(
                                  aiAnalysis.nlp_metadata.dominant_error_pattern
                                );
                                return (
                                  <div
                                    className={`${pattern.color} rounded-lg px-3 py-2 text-sm font-medium inline-flex items-center gap-2`}
                                  >
                                    <span>{pattern.icon}</span>
                                    <span>{pattern.label}</span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {aiAnalysis.nlp_metadata.error_patterns && (
                            <div className="bg-white rounded-lg p-4">
                              <p className="font-semibold text-gray-800 mb-3 text-sm">
                                📈 Error Pattern Distribution:
                              </p>
                              <div className="space-y-2">
                                {Object.entries(
                                  aiAnalysis.nlp_metadata.error_patterns
                                ).map(([pattern, count]) => {
                                  const patternInfo =
                                    getErrorPatternBadge(pattern);
                                  const percentage = aiAnalysis.total_incorrect
                                    ? (
                                        (count / aiAnalysis.total_incorrect) *
                                        100
                                      ).toFixed(0)
                                    : 0;
                                  return (
                                    <div
                                      key={pattern}
                                      className="flex items-center gap-3"
                                    >
                                      <span className="text-lg">
                                        {patternInfo.icon}
                                      </span>
                                      <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                          <span className="text-gray-700">
                                            {patternInfo.label}
                                          </span>
                                          <span className="font-semibold text-gray-600">
                                            {count} ({percentage}%)
                                          </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div
                                            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Overall analysis card */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <span>📊</span> Overall Performance Analysis
                        </h3>
                        <p className="text-gray-700 leading-relaxed mb-3">
                          {aiAnalysis.overall_analysis}
                        </p>

                        {aiAnalysis.learning_style_recommendation && (
                          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-3">
                            <p className="font-semibold text-blue-900 mb-1 text-sm">
                              💡 Recommended Learning Approach:
                            </p>
                            <p className="text-blue-800 text-sm">
                              {aiAnalysis.learning_style_recommendation}
                            </p>
                          </div>
                        )}

                        <div className="bg-white rounded-lg p-3 mt-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">
                              Estimated Study Time:
                            </span>{" "}
                            {aiAnalysis.estimated_study_time}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-semibold">
                              Questions to Review:
                            </span>{" "}
                            {aiAnalysis.total_incorrect ?? 0} out of{" "}
                            {total_questions}
                          </p>
                        </div>
                      </div>

                      {/* Conceptual clusters */}
                      {aiAnalysis.conceptual_clusters &&
                        aiAnalysis.conceptual_clusters.length > 0 && (
                          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-teal-900 mb-4 flex items-center gap-2">
                              <span>🔗</span> Connected Concepts
                            </h3>
                            <p className="text-sm text-teal-800 mb-4">
                              These topics are related. Understanding one will
                              help with the others:
                            </p>
                            <div className="space-y-3">
                              {aiAnalysis.conceptual_clusters.map(
                                (cluster, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white rounded-lg p-4"
                                  >
                                    <p className="font-semibold text-gray-800 mb-2">
                                      {cluster.cluster_name}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      {cluster.concepts.map((concept, i) => (
                                        <span
                                          key={i}
                                          className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-sm"
                                        >
                                          {concept}
                                        </span>
                                      ))}
                                    </div>
                                    <p className="text-sm text-gray-600 italic">
                                      {cluster.relationship}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Weak topics breakdown */}
                      {aiAnalysis.weak_topics &&
                        aiAnalysis.weak_topics.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-gray-800">
                              🎯 Topics Needing Attention
                            </h3>
                            {aiAnalysis.weak_topics.map((topic, idx) => (
                              <div
                                key={idx}
                                className={`rounded-lg border-2 p-6 ${getSeverityColor(
                                  topic.severity
                                )}`}
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-2xl">
                                        {getSeverityIcon(topic.severity)}
                                      </span>
                                      <h4 className="text-xl font-bold">
                                        {topic.topic}
                                      </h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm uppercase font-semibold tracking-wide">
                                        {topic.severity} Priority
                                      </p>
                                      {topic.error_pattern && (
                                        <span
                                          className={`text-xs px-2 py-1 rounded ${
                                            getErrorPatternBadge(
                                              topic.error_pattern
                                            ).color
                                          }`}
                                        >
                                          {
                                            getErrorPatternBadge(
                                              topic.error_pattern
                                            ).icon
                                          }{" "}
                                          {
                                            getErrorPatternBadge(
                                              topic.error_pattern
                                            ).label
                                          }
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-600">
                                      Questions:{" "}
                                      {topic.questions_affected?.join(", ")}
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 mb-3">
                                  <p className="font-semibold text-gray-800 mb-2">
                                    📝 What went wrong:
                                  </p>
                                  <p className="text-gray-700">
                                    {topic.description}
                                  </p>
                                </div>

                                {topic.common_misconception && (
                                  <div className="bg-white rounded-lg p-4 mb-3">
                                    <p className="font-semibold text-gray-800 mb-2">
                                      ⚠️ Common Misconception:
                                    </p>
                                    <p className="text-gray-700">
                                      {topic.common_misconception}
                                    </p>
                                  </div>
                                )}

                                {topic.conceptual_relationships && (
                                  <div className="bg-white rounded-lg p-4 mb-3">
                                    <p className="font-semibold text-gray-800 mb-2">
                                      🔗 Related to Other Topics:
                                    </p>
                                    <p className="text-gray-700 text-sm">
                                      {topic.conceptual_relationships}
                                    </p>
                                  </div>
                                )}

                                {topic.key_concepts_to_learn && (
                                  <div className="bg-white rounded-lg p-4 mb-3">
                                    <p className="font-semibold text-gray-800 mb-2">
                                      🔑 Key Concepts to Learn:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {topic.key_concepts_to_learn.map(
                                        (c, i) => (
                                          <span
                                            key={i}
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                          >
                                            {c}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {topic.study_recommendations && (
                                  <div className="bg-white rounded-lg p-4">
                                    <p className="font-semibold text-gray-800 mb-2">
                                      💡 How to Improve:
                                    </p>
                                    <ul className="space-y-2">
                                      {topic.study_recommendations.map(
                                        (rec, i) => (
                                          <li
                                            key={i}
                                            className="flex items-start gap-2 text-gray-700"
                                          >
                                            <span className="text-blue-600 font-bold">
                                              {i + 1}.
                                            </span>
                                            <span>{rec}</span>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Priority action plan */}
                      {aiAnalysis.priority_actions && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center gap-2">
                            <span>🚀</span> Your Action Plan
                          </h3>
                          <div className="space-y-3">
                            {aiAnalysis.priority_actions.map((action, i) => (
                              <div
                                key={i}
                                className="bg-white rounded-lg p-4 flex items-start gap-3"
                              >
                                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                                  {i + 1}
                                </div>
                                <p className="text-gray-700 pt-1">{action}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-center">
                        <button
                          onClick={fetchAiAnalysis}
                          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                        >
                          🔄 Refresh Analysis
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          <div className="text-center mt-8 space-x-4">
            <button
              onClick={() => navigate("/student")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate("/quiz/new")}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Take Another Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;
