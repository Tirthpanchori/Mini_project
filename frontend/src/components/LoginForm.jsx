import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { setTokens } from "../utils/token";

function LoginForm({ method, route }) {
  const dummyData = {
    email: `demo${Math.floor(Math.random() * 10)}@example.com`,
    password: "password123",
    role: "student",
    username: "DemoUser",
  };

  const [email, setEmail] = useState(dummyData.email);
  const [username, setUsername] = useState(dummyData.username);
  const [password, setPassword] = useState(dummyData.password);
  const [role, setRole] = useState(dummyData.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (method === "login") {
        const response = await api.post(route, {
          email,       
          password,
        });

        // Save tokens
        setTokens(response.data.access, response.data.refresh);

        // Redirect based on role
        const userRole = response.data.role.toLowerCase();
        localStorage.setItem("role", response.data.role);
        navigate(userRole === "teacher" ? "/teacher" : "/student");

      } else if (method === "register") {
        const response = await api.post(route, {
          email,
          username: username , 
          password,
          role: role.toLowerCase(),
        });

        navigate("/login");
      }
    } catch (err) {
      console.error("Error during authentication:", err);
      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{method === "login" ? "Login" : "Register"}</h2>

      {method === "register" && (
        <>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Username </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </>
      )}

      {method === "login" && (
        <>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </>
      )}

      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Loading..." : method === "login" ? "Login" : "Register"}
      </button>
    </form>
  );
}

export default LoginForm;