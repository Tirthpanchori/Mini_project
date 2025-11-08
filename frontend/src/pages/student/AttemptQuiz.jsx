import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // ✅ axios instance with tokens

function AttemptQuiz() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleStartQuiz = async () => {
    if (!code.trim()) {
      setError("Please enter a quiz code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ✅ POST request to verify quiz code
      const res = await api.post("/attempts/verify-code/", { code });
      const quiz = res.data.quiz;

      // ✅ Redirect to quiz start page
      navigate(`/quiz/${quiz.quiz_id}/start`, { state: { quiz } });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to verify quiz code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #e3eeff 0%, #f7faff 100%)",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "40px 30px",
          borderRadius: "16px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            color: "#1a237e",
            marginBottom: "20px",
            fontSize: "26px",
            fontWeight: "700",
          }}
        >
          Enter Quiz Code
        </h2>

        <input
          type="text"
          placeholder="e.g. X7AB9Q"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          style={{
            width: "80%",
            padding: "12px",
            fontSize: "16px",
            border: "2px solid #4d90fe",
            borderRadius: "8px",
            marginBottom: "20px",
            outline: "none",
            textAlign: "center",
            letterSpacing: "2px",
            fontWeight: "500",
            transition: "0.3s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#1a73e8")}
          onBlur={(e) => (e.target.style.borderColor = "#4d90fe")}
        />

        <button
          onClick={handleStartQuiz}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#a0c2ff" : "#4d90fe",
            color: "white",
            fontSize: "18px",
            padding: "10px 25px",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.3s, transform 0.1s",
          }}
          onMouseOver={(e) =>
            !loading && (e.target.style.backgroundColor = "#1a73e8")
          }
          onMouseOut={(e) =>
            !loading && (e.target.style.backgroundColor = "#4d90fe")
          }
          onMouseDown={(e) => (e.target.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
        >
          {loading ? "Checking..." : "Start Quiz"}
        </button>

        {error && (
          <p
            style={{
              color: "red",
              marginTop: "15px",
              fontWeight: "500",
              fontSize: "15px",
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default AttemptQuiz;
