import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { setTokens } from "../utils/token";

function LoginForm({ method, route }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // default role
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
          username, // login with username
          password,
        });

        // Save tokens
        setTokens(response.data.access, response.data.refresh);

        // Redirect based on role from backend
        const userRole = response.data.role.toLowerCase();
        localStorage.setItem("role", response.data.role);
        if (userRole === "teacher") {
          navigate("/teacher");
        } else {
          navigate("/student");
        }

      } else if (method === "register") {
        // Send username, email, password, role
        console.log({ username, email, password, role }); // debug log

        const response = await api.post(route, {
          username,
          email,
          password,
          role: role.toLowerCase(),
        });

        // After successful registration, go to login page
        navigate("/login");
      }
    } catch (err) {
      console.error("Error during authentication:", err);
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
  onSubmit={handleSubmit}
  className="bg-white  p-8 w-full max-w-md space-y-4"
>
  {/* <h2 className="text-2xl font-bold text-center text-blue-600">
    {method === "login" ? "Login" : "Register"}
  </h2> */}

  {method === "register" && (
    <>
      <div className="flex flex-col text-left">
        <label className="mb-1 text-gray-700 font-medium">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
        />
      </div>

      <div className="flex flex-col text-left">
        <label className="mb-1 text-gray-700 font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
        />
      </div>

      <div className="flex flex-col text-left">
        <label className="mb-1 text-gray-700 font-medium">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
      </div>
    </>
  )}

  {method === "login" && (
    <div className="flex flex-col text-left">
      <label className="mb-1 text-gray-700 font-medium">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
      />
    </div>
  )}

  <div className="flex flex-col text-left">
    <label className="mb-1 text-gray-700 font-medium">Password</label>
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
    />
  </div>

  {error && <p className="text-red-500 text-sm">{error}</p>}

  <button
    type="submit"
    disabled={loading}
    className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
  >
    {loading ? "Loading..." : method === "login" ? "Login" : "Register"}
  </button>
</form>
  );
}

export default LoginForm;
