import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import api from "../../services/api";

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: attemptId } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI Analysis States
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // 🔥 Try location.state → attemptId → localStorage
  useEffect(() => {
    const fromState = location.state;

    if (fromState) {
      setResult(fromState);
      localStorage.setItem("lastAttempt", JSON.stringify(fromState));
      setLoading(false);
    } else if (attemptId) {
      fetchResultFromBackend(attemptId);
    } else {
      const saved = localStorage.getItem("lastAttempt");
      if (saved) setResult(JSON.parse(saved));
      setLoading(false);
    }
  }, [attemptId, location.state]);

  // Fetch result from backend using attempt_id
  const fetchResultFromBackend = async (id) => {
    try {
      const res = await api.get(`/attempts/result/${id}/`);
      setResult(res.data);
      localStorage.setItem("lastAttempt", JSON.stringify(res.data));
    } catch (err) {
      console.error("Failed to fetch result:", err);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 🔥 AI Analysis Fetch Function
  // ===============================
  const fetchAiAnalysis = async () => {
    if (!result?.results) return;

    setLoadingAnalysis(true);
    setAnalysisError(null);

    try {
      const token = localStorage.getItem("access_token");

      const res = await axios.post(
        "http://127.0.0.1:8000/api/ai/analyze-weak-topics/",
        { quiz_results: result.results },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        setAiAnalysis(res.data);
      } else {
        setAnalysisError(res.data.error);
      }
    } catch (err) {
      setAnalysisError(
        err.response?.data?.error ||
          err.message ||
          "Failed to analyze topics."
      );
    }

    setLoadingAnalysis(false);
  };

  useEffect(() => {
    if (showAnalysis && !aiAnalysis && !loadingAnalysis) {
      fetchAiAnalysis();
    }
  }, [showAnalysis]);

  // ===============================
  // 🔥 Helper Functions (icons, colors, badges)
  // ===============================

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "text-red-700 bg-red-100 border-red-300";
      case "high": return "text-orange-700 bg-orange-100 border-orange-300";
      case "moderate": return "text-yellow-700 bg-yellow-100 border-yellow-300";
      default: return "text-gray-700 bg-gray-100 border-gray-300";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical": return "🔴";
      case "high": return "🟠";
      case "moderate": return "🟡";
      default: return "⚪";
    }
  };

  // ===============================
  // 🔥 Loading & No-Data Handling
  // ===============================

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading result...
      </div>
    );

  if (!result)
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

  const { quiz_title, score, correct_answers, total_questions, results } = result;

  // ===============================
  // 🔥 MAIN UI RENDER
  // ===============================

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex justify-center p-10">
      <div className="w-full max-w-4xl space-y-6">

        {/* ======================== */}
        {/*       HEADER CARD       */}
        {/* ======================== */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          
          <h2 className="text-center text-3xl font-bold text-gray-800 mb-4">
            {quiz_title || "Quiz Result"}
          </h2>

          <div className="text-center mb-6">
            <p className="text-lg text-gray-700">
              Score:{" "}
              <span className="font-bold text-blue-600">
                {score.toFixed(2)}%
              </span>
            </p>
            <p className="text-gray-600">
              {correct_answers} / {total_questions} correct
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 justify-center">
            <button
              onClick={() => setShowAnalysis(false)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                !showAnalysis
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Detailed Review
            </button>

            <button
              onClick={() => setShowAnalysis(true)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                showAnalysis
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              🧠 AI Analysis with NLP
            </button>
          </div>

          {/* ======================== */}
          {/*    DETAILED REVIEW UI    */}
          {/* ======================== */}
          {!showAnalysis ? (
            <>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Detailed Review
              </h3>

              <div className="space-y-4">
                {results.map((q, i) => (
                  <div
                    key={q.question_id}
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
                        {q.selected_option_text || "NA"}
                      </span>
                    </p>

                    <p>
                      Correct Answer:{" "}
                      <span className="font-semibold text-green-700">
                        {q.correct_option_text}
                      </span>
                    </p>

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
            <>
              {/* ======================== */}
              {/*      AI ANALYSIS UI      */}
              {/* ======================== */}

              {loadingAnalysis && (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-600">Analyzing your performance...</p>
                </div>
              )}

              {analysisError && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-red-600">{analysisError}</p>
                  <button
                    onClick={fetchAiAnalysis}
                    className="mt-3 bg-red-600 text-white px-4 py-1 rounded"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loadingAnalysis && aiAnalysis && (
                <>
                  {/* Entire AI UI from your first version is included here */}
                  {/* (I kept it unchanged for full compatibility) */}

                  {/* === Overall analysis card === */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <span>📊</span> Overall Performance Analysis
                    </h3>
                    <p className="text-gray-700">{aiAnalysis.overall_analysis}</p>
                  </div>

                  {/* === Weak Topics === */}
                  {aiAnalysis.weak_topics?.length > 0 && (
                    <div className="mt-6 space-y-4">
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
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">
                              {getSeverityIcon(topic.severity)}
                            </span>
                            <h4 className="text-xl font-bold">{topic.topic}</h4>
                          </div>

                          <p className="text-sm mb-2">{topic.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-center mt-4">
                    <button
                      onClick={fetchAiAnalysis}
                      className="bg-gray-200 px-4 py-2 rounded-lg"
                    >
                      Refresh AI Analysis
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ======================== */}
          {/*       ACTION BUTTONS     */}
          {/* ======================== */}
          <div className="text-center mt-8 space-x-4">
            <button
              onClick={() => navigate("/student")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate("/quiz/new")}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
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
