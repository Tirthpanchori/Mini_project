import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

function Start() {
  const { id } = useParams(); // quiz_id
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading quiz...</p>;
  if (error)
    return <p style={{ color: "red", textAlign: "center", marginTop: "40px" }}>{error}</p>;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f4ff", // soft blue background
        display: "flex",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          padding: "30px 40px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "28px",
            fontWeight: "700",
            color: "#333",
            marginBottom: "10px",
          }}
        >
          {quiz.title}
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
            fontSize: "15px",
          }}
        >
          ⏱ Timer: {quiz.timer} sec | Total Questions: {quiz.questions.length}
        </p>

        {/* Question List */}
        {quiz.questions.map((q, i) => (
          <div
            key={q.id}
            style={{
              backgroundColor: "#f8faff",
              border: "1px solid #dbe5ff",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "20px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
            }}
          >
            <h4
              style={{
                fontSize: "18px",
                color: "#1a237e",
                marginBottom: "12px",
                fontWeight: "600",
              }}
            >
              {i + 1}. {q.text}
            </h4>

            <div style={{ display: "grid", gap: "10px" }}>
              {["A", "B", "C", "D"].map((opt) => (
                <label
                  key={opt}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #d0d7ff",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#eef3ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ffffff")
                  }
                >
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={opt}
                    style={{ marginRight: "10px", accentColor: "#4d90fe" }}
                  />
                  <span>{q[`option_${opt.toLowerCase()}`]}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          style={{
            width: "100%",
            backgroundColor: "#4d90fe",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "17px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#1a73e8")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#4d90fe")}
          onClick={() => alert("Submit logic coming soon!")}
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
}

export default Start;
