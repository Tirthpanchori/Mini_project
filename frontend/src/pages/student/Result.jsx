import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(() => {
    const fromState = location.state;
    if (fromState) return fromState;
    const saved = localStorage.getItem("lastAttempt");
    return saved ? JSON.parse(saved) : null;
  });
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    if (location.state) {
      localStorage.setItem("lastAttempt", JSON.stringify(location.state));
    }
  }, [location.state]);

  // Fetch AI analysis when switching to analysis tab
  useEffect(() => {
    if (showAnalysis && !aiAnalysis && !loadingAnalysis) {
      fetchAiAnalysis();
    }
  }, [showAnalysis]);

  const fetchAiAnalysis = async () => {
    setLoadingAnalysis(true);
    setAnalysisError(null);

    try {
      const token = localStorage.getItem("access_token");
      console.log("Token being sent:", token);

  const response = await axios.post(
  "http://127.0.0.1:8000/api/ai/analyze-weak-topics/",
  { quiz_results: result.results },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }
);

      if (response.data.success) {
        setAiAnalysis(response.data);
      } else {
        setAnalysisError(response.data.error || "Analysis failed");
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

  if (!result) {
    return (
      <div className="text-center mt-10">
        <p className="text-gray-600 mb-4">No result data found.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { score, correct_answers, total_questions, results } = result;

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

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex justify-center p-10">
      <div className="w-full max-w-4xl space-y-6">
        {/* Main Result Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-center text-3xl font-bold text-gray-800 mb-4">
            Quiz Result
          </h2>
          <div className="text-center mb-6">
            <p className="text-lg text-gray-700">
              Score:{" "}
              <span className="font-bold text-blue-600">{score.toFixed(2)}%</span>
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
              AI Weak Topics Analysis
            </button>
          </div>

          {/* Conditional Rendering */}
          {!showAnalysis ? (
            // Original Detailed Review
            <>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Detailed Review
              </h3>
              <div className="space-y-4">
                {results.map((q, i) => (
                  <div
                    key={q.question_id || i}
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
                        {q.selected_option_text}
                      </span>
                    </p>
                    <p>
                      Correct Answer:{" "}
                      <span className="font-semibold text-green-700">
                        {q.correct_option_text}
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
                ))}
              </div>
            </>
          ) : (
            // AI-Powered Weak Topics Analysis
            <div className="space-y-6">
              {loadingAnalysis && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">
                    Analyzing your performance with AI...
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    This may take a few seconds
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
                  {/* Perfect Score */}
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
                          {aiAnalysis.priority_actions.map((action, i) => (
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
                      {/* Overall Analysis */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <span>📊</span> Overall Performance Analysis
                        </h3>
                        <p className="text-gray-700 leading-relaxed mb-3">
                          {aiAnalysis.overall_analysis}
                        </p>
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
                            {aiAnalysis.total_incorrect} out of {total_questions}
                          </p>
                        </div>
                      </div>

                      {/* Weak Topics Breakdown */}
                      {aiAnalysis.weak_topics && aiAnalysis.weak_topics.length > 0 && (
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
                                  <p className="text-sm uppercase font-semibold tracking-wide">
                                    {topic.severity} Priority
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">
                                    Questions: {topic.questions_affected.join(", ")}
                                  </p>
                                </div>
                              </div>

                              {/* Description */}
                              <div className="bg-white rounded-lg p-4 mb-3">
                                <p className="font-semibold text-gray-800 mb-2">
                                  📝 What went wrong:
                                </p>
                                <p className="text-gray-700">
                                  {topic.description}
                                </p>
                              </div>

                              {/* Common Misconception */}
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

                              {/* Key Concepts */}
                              {topic.key_concepts_to_learn && (
                                <div className="bg-white rounded-lg p-4 mb-3">
                                  <p className="font-semibold text-gray-800 mb-2">
                                    🔑 Key Concepts to Learn:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {topic.key_concepts_to_learn.map((concept, i) => (
                                      <span
                                        key={i}
                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                      >
                                        {concept}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Study Recommendations */}
                              {topic.study_recommendations && (
                                <div className="bg-white rounded-lg p-4">
                                  <p className="font-semibold text-gray-800 mb-2">
                                    💡 How to Improve:
                                  </p>
                                  <ul className="space-y-2">
                                    {topic.study_recommendations.map((rec, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-gray-700"
                                      >
                                        <span className="text-blue-600 font-bold">
                                          {i + 1}.
                                        </span>
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Priority Action Plan */}
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

                      {/* Refresh Analysis Button */}
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