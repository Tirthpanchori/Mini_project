import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { setTokens } from "../utils/token";

function LoginForm({ method, route }) {
  const dummyData = {
    email: `demo3@example.com`,
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
  const [showPassword, setShowPassword] = useState(false);
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
  <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto my-16 bg-white border border-blue-200 rounded-2xl shadow-xl p-6 space-y-3">
    <h2 className="text-2xl font-semibold text-center text-blue-700">
      {method === "login" ? "Login" : "Register"}
    </h2>

    {method === "register" && (
      <>
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-blue-200 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200/60"
        />

        <label className="block text-sm font-medium text-slate-700">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-blue-200 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200/60"
        />

        <label className="block text-sm font-medium text-slate-700">Role</label>
        <div className="relative">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="
              mt-1 w-full rounded-xl border border-blue-200 bg-white px-3 py-2 pr-10
              text-slate-800 appearance-none outline-none
              transition
              hover:border-blue-300
              focus:border-blue-500 focus:ring-4 focus:ring-blue-200/60
            "
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          {/* Custom dropdown arrow */}
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-blue-500"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>

      </>
    )}

    {method === "login" && (
      <>
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-blue-200 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200/60"
        />
      </>
    )}

    <label className="block text-sm font-medium text-slate-700">Password</label>
    <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="mt-1 w-full rounded-xl border border-blue-200 px-3 py-2 pr-10 outline-none transition 
                focus:border-blue-500 focus:ring-4 focus:ring-blue-200/60"
    />
  

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-blue-600 transition"
      >
        {showPassword ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.5 12c2.248 4.667 6.329 7.5 10.5 7.5 1.828 0 3.59-.45 5.18-1.26M21 12a10.477 10.477 0 00-2.48-3.777M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>


    {error && (
      <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
        {error}
      </p>
    )}

    <button
      type="submit"
      disabled={loading}
      className="w-full mt-2 rounded-xl bg-blue-600 text-white font-semibold py-2.5 transition hover:bg-blue-700 hover:shadow-lg active:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? "Loading..." : method === "login" ? "Login" : "Register"}
    </button>
  </form>
);

}

export default LoginForm;