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
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      {/* Method Title - hidden visually if Tabs handle it, but good for accessibility/fallback. 
          Actually user said 'Add a tab switch UI at the top', so we might not need the title inside the form.
          I'll remove the <h2> inside. */
      }

      <div className="space-y-4">
        {method === "register" && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 outline-none transition-all focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 placeholder:text-slate-600"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 outline-none transition-all focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 placeholder:text-slate-600"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">I am a</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 pr-10 outline-none transition-all focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 appearance-none cursor-pointer hover:border-slate-600"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}

        {method === "login" && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-slate-600"
              placeholder="name@example.com"
            />
          </div>
        )}

        <div>
           <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-300">Password</label>
            {method === "login" && (
              <a href="#" className="text-xs font-medium text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                Forgot password?
              </a>
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 pr-10 outline-none transition-all placeholder:text-slate-600 ${
                  method === "login" 
                    ? "focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" 
                    : "focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20"
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.5 12c2.248 4.667 6.329 7.5 10.5 7.5 1.828 0 3.59-.45 5.18-1.26M21 12a10.477 10.477 0 00-2.48-3.777M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transform transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed ${
            method === 'login' 
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-violet-500/25' 
            : 'bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:shadow-fuchsia-500/25'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          method === "login" ? "Sign In" : "Create Account"
        )}
      </button>
    </form>
  );
}



export default LoginForm;