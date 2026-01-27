import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", role: "", id: "" });

  useEffect(() => {
    // Get user info from localStorage or context (simplified here)
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("name");
    const storedId = localStorage.getItem("userId");

    setUser({
      name: storedName || "User",
      role: storedRole || "student",
      id: storedId || "",
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handleQuizAction = () => {
    if (user.role === "teacher") {
      navigate("/create-quiz");
    } else {
      navigate("/attempt-quiz");
    }
  };

  const handleRecentQuizzes = () => {
    if (user.role === "teacher") {
      navigate("/recent-teacher-quizzes");
    } else {
      navigate("/recent-quizzes");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">
          Welcome, <span className="text-blue-600">{user.name}</span> 👋
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 - Create/Join Quiz */}
        <div
          onClick={handleQuizAction}
          className="bg-white shadow-md rounded-xl p-6 cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">
            {user.role === "teacher" ? "Create a New Quiz" : "Join a Quiz"}
          </h2>
          <p className="text-gray-600">
            {user.role === "teacher"
              ? "Generate a unique code for your students to attempt."
              : "Enter a quiz code shared by your teacher to start."}
          </p>
        </div>

        {/* Example card - past quizzes */}
        <div 
          onClick={handleRecentQuizzes}
          className="bg-white shadow-md rounded-xl p-6 cursor-pointer hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Recent Quizzes</h2>
          <p className="text-gray-600">
            View your {user.role === "teacher" ? "created" : "attempted"} quizzes here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
