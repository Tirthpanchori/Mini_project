
import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { setTokens } from "../utils/token";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Mail, Lock, User, Eye, EyeOff, ChevronRight, AlertCircle, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

function LoginForm({ method, route }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
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
        const response = await api.post(route, { email, password });
        setTokens(response.data.access, response.data.refresh);
        const userRole = response.data.role.toLowerCase();
        localStorage.setItem("role", response.data.role);
        navigate(userRole === "teacher" ? "/teacher" : "/student");

      } else if (method === "register") {
        await api.post(route, {
          email,
          username, 
          password,
          role: role.toLowerCase(),
        });
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Authentication failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit} 
      className="space-y-5"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {method === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          {method === "login" 
            ? "Enter your credentials to access your account" 
            : "Join us and start creating quizzes today"}
        </p>
      </div>

      {method === "register" && (
        <div className="space-y-4">
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Account Role</label>
            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
              {['student', 'teacher'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                    role === r 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <Input
            icon={User}
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="JohnDoe"
            required
          />
        </div>
      )}

      <Input
        icon={Mail}
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />

      <div className="relative">
        <Input
          icon={Lock}
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-sm text-red-600"
        >
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </motion.div>
      )}

      <Button 
        type="submit" 
        className="w-full h-11 text-base shadow-lg shadow-primary-500/20" 
        isLoading={loading}
      >
        {method === "login" ? "Sign In" : "Sign Up"}
        {!loading && <ChevronRight size={18} className="ml-1" />}
      </Button>

      <div className="text-center pt-2">
        <p className="text-sm text-slate-500">
          {method === "login" ? "Don't have an account? " : "Already have an account? "}
          <Link 
            to={method === "login" ? "/register" : "/login"} 
            className="text-primary-600 font-semibold hover:text-primary-700 hover:underline"
          >
            {method === "login" ? "Sign up" : "Log in"}
          </Link>
        </p>
      </div>
    </motion.form>
  );
}

export default LoginForm;