import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  LogOut, 
  Zap, 
  Clock, 
  Trophy, 
  Target, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

function HomeS() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState({ type: "", message: "" });
  
  // Fetch Attempts on Mount
  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await api.get("/attempts/recent-quizzes/");
        setAttempts(res.data);
      } catch (err) {
        console.error("Failed to fetch attempts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleJoinQuiz = async (e) => {
    e.preventDefault();
    if (!code) return;

    setVerifying(true);
    setVerifyStatus({ type: "", message: "" });

    try {
      const res = await api.post("/attempts/verify-code/", { code: code.toUpperCase() });
      setVerifyStatus({ type: "success", message: "Code verified ✅ Redirecting..." });
      
      // Navigate after short delay to show success message
      setTimeout(() => {
        navigate(`/quiz/${res.data.quiz.quiz_id}/start`);
      }, 1000);
    } catch (err) {
      setVerifyStatus({ 
        type: "error", 
        message: err.response?.data?.detail || "Invalid code. Please try again." 
      });
    } finally {
      if (!code) setVerifying(false); // Only stop loading if we failed immediately or similar logic
      // Actually we keep loading true on success to show the "Redirecting" state
      if (verifyStatus.type !== 'success') setVerifying(false); 
    }
  };

  // Compute Stats
  const stats = useMemo(() => {
    if (!attempts.length) return { total: 0, avg: 0, best: 0 };
    
    const scores = attempts.map(a => a.score);
    const total = attempts.length;
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / total);
    const best = Math.max(...scores);

    return { total, avg, best };
  }, [attempts]);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Loading Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* 1) Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
               Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Dashboard</span>
            </h1>
            <p className="text-slate-400">Enter a quiz code below to start your attempt.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="self-start md:self-center px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all font-medium flex items-center gap-2 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" /> Logout
          </button>
        </div>

        {/* 2) Main Hero Card (Join Quiz) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Background Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-600/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 text-center max-w-lg mx-auto">
             <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-lg">
                <Zap className="text-violet-400 w-8 h-8 fill-violet-400/20" />
             </div>
             
             <h2 className="text-3xl font-bold text-white mb-3">Join a Quiz</h2>
             <p className="text-slate-400 mb-8">Enter the 6-digit unique code shared by your teacher to begin.</p>

             <form onSubmit={handleJoinQuiz} className="space-y-4">
                <div className="relative">
                   <input 
                     type="text" 
                     placeholder="ENTER CODE" 
                     value={code}
                     onChange={(e) => {
                       setCode(e.target.value.toUpperCase());
                       setVerifyStatus({ type: "", message: "" });
                     }}
                     maxLength={10}
                     className={`w-full bg-slate-950/80 border-2 rounded-2xl px-6 py-4 text-center text-2xl font-bold tracking-widest outline-none transition-all placeholder:text-slate-700 placeholder:font-medium placeholder:tracking-normal ${
                        verifyStatus.type === 'error' 
                        ? 'border-rose-500/50 text-rose-400 focus:border-rose-500 focus:shadow-lg focus:shadow-rose-500/20' 
                        : verifyStatus.type === 'success'
                        ? 'border-emerald-500/50 text-emerald-400'
                        : 'border-slate-800 text-white focus:border-violet-500 focus:shadow-lg focus:shadow-violet-500/20'
                     }`}
                   />
                </div>

                {verifyStatus.message && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm font-medium flex items-center justify-center gap-2 ${
                       verifyStatus.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                     {verifyStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                     {verifyStatus.message}
                  </motion.div>
                )}

                <p className="text-xs text-slate-500 font-medium tracking-wide">CODE FORMAT: A-Z, 0-9</p>

                <button 
                  disabled={!code || verifying}
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-4"
                >
                   {verifying && verifyStatus.type !== 'success' ? 'Verifying...' : 'Verify & Start Quiz'}
                   {!verifying && <ChevronRight size={20} />}
                </button>
             </form>
          </div>
        </motion.div>

        {/* 3) Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-colors"
           >
              <div>
                 <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Attempts</p>
                 <p className="text-3xl font-bold text-white group-hover:scale-110 transition-transform origin-left">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                 <BookOpen size={24} />
              </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-colors"
           >
              <div>
                 <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Average Score</p>
                 <p className="text-3xl font-bold text-white group-hover:scale-110 transition-transform origin-left">{stats.avg}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400">
                 <Target size={24} />
              </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-colors"
           >
              <div>
                 <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Best Score</p>
                 <p className="text-3xl font-bold text-emerald-400 group-hover:scale-110 transition-transform origin-left">{stats.best}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                 <Trophy size={24} />
              </div>
           </motion.div>
        </div>

        {/* 4) Recent Attempts Section */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <Clock className="text-violet-400" size={20} /> Recent Attempts
             </h2>
             <Link to="/recent-quizzes" className="text-sm font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1 group">
               View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </Link>
           </div>

           {attempts.length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-12 text-center">
                 <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="text-slate-600 w-8 h-8" />
                 </div>
                 <h3 className="text-lg font-medium text-white mb-2">No attempts yet</h3>
                 <p className="text-slate-500">Enter a code above to start your first quiz!</p>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {attempts.slice(0, 5).map((attempt, i) => (
                    <motion.div
                       key={attempt.id}
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: 0.4 + (i * 0.1) }}
                       className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all group relative overflow-hidden"
                    >
                       <div className="flex justify-between items-start mb-4">
                          <div>
                             <h3 className="font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">{attempt.quiz.title}</h3>
                             <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock size={12} /> {new Date(attempt.attempted_at).toLocaleDateString()}
                             </p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getScoreColor(attempt.score)}`}>
                             {attempt.score}%
                          </span>
                       </div>
                       
                       <button 
                         onClick={() => navigate(`/result/${attempt.id}`)}
                         className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2"
                       >
                         View Result <ChevronRight size={14} />
                       </button>
                    </motion.div>
                 ))}
              </div>
           )}
        </div>

      </div>
    </div>
  );
}

export default HomeS;
