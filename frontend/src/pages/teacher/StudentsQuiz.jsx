import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Copy, 
  Users, 
  Trophy, 
  Target, 
  ArrowRight,
  Clock,
  User,
  Layout,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

function StudentsAttempts() {
  const { id: quizId } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortUser, setSortUser] = useState("latest"); // "latest", "highest", "lowest"
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await api.get(`/quiz/${quizId}/attempts/`);
        setQuizData(res.data);
      } catch (err) {
        console.error("Error fetching quiz attempts:", err);
        setError("Could not load student attempts.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [quizId]);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    // Optional: Add toast notification Logic here
  };

  // Derived Stats
  const stats = useMemo(() => {
    if (!quizData?.attempts || quizData.attempts.length === 0) return { avg: 0, highest: 0 };
    const scores = quizData.attempts.map(a => a.score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const highest = Math.max(...scores);
    return { avg, highest };
  }, [quizData]);

  // Filter & Sort Logic
  const filteredAttempts = useMemo(() => {
    if (!quizData?.attempts) return [];

    let filtered = quizData.attempts.filter(a => 
      a.student_name.toLowerCase().includes(search.toLowerCase())
    );

    if (sortUser === "latest") {
      filtered.sort((a, b) => new Date(b.attempted_at) - new Date(a.attempted_at));
    } else if (sortUser === "highest") {
      filtered.sort((a, b) => b.score - a.score);
    } else if (sortUser === "lowest") {
      filtered.sort((a, b) => a.score - b.score);
    }

    return filtered;
  }, [quizData, search, sortUser]);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Loading Attempts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
         <div className="text-center">
            <p className="text-rose-400 mb-4">{error}</p>
            <button
               onClick={() => navigate("/recent-teacher-quizzes")}
               className="px-5 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
               Go Back
            </button>
         </div>
      </div>
    );
  }

  const { quiz_title, quiz_code } = quizData || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30 p-6 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="space-y-6">
           {/* Breadcrumb / Back */}
           <button 
             onClick={() => navigate('/recent-teacher-quizzes')}
             className="text-slate-500 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors"
           >
             <ArrowRight className="rotate-180" size={14} /> Back to Library
           </button>

           <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                 <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{quiz_title}</h1>
                    <button 
                       onClick={() => copyToClipboard(quiz_code)}
                       className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-mono font-bold hover:bg-violet-500/20 hover:text-violet-300 transition-colors"
                    >
                       {quiz_code} <Copy size={12} />
                    </button>
                 </div>
                 <p className="text-slate-400">View performance metrics and individual student results.</p>
              </div>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                 <Users size={24} />
              </div>
              <div>
                 <p className="text-slate-500 text-sm font-medium">Total Attempts</p>
                 <p className="text-2xl font-bold text-white">{quizData.total_attempts}</p>
              </div>
           </div>
           
           <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
                 <Target size={24} />
              </div>
              <div>
                 <p className="text-slate-500 text-sm font-medium">Avg. Score</p>
                 <p className="text-2xl font-bold text-white">{stats.avg}%</p>
              </div>
           </div>

           <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                 <Trophy size={24} />
              </div>
              <div>
                 <p className="text-slate-500 text-sm font-medium">Highest Score</p>
                 <p className="text-2xl font-bold text-white">{stats.highest}%</p>
              </div>
           </div>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-900/40 p-2 rounded-2xl border border-slate-800/50 backdrop-blur-sm flex flex-col md:flex-row gap-4">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
             <input 
               type="text" 
               placeholder="Search student name..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-600"
             />
           </div>
           
           <div className="relative min-w-[200px]">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
             <select 
               value={sortUser}
               onChange={(e) => setSortUser(e.target.value)}
               className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-slate-200 outline-none focus:border-violet-500/50 appearance-none cursor-pointer"
             >
               <option value="latest">Latest First</option>
               <option value="highest">Highest Score</option>
               <option value="lowest">Lowest Score</option>
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
           </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30">
           <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/80 text-slate-400 font-medium text-sm">
                 <tr>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Attempted At</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4 text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                 {filteredAttempts.length > 0 ? (
                    filteredAttempts.map((attempt) => (
                       <motion.tr 
                          key={attempt.attempt_id}
                          layoutId={`row-${attempt.attempt_id}`}
                          className="group hover:bg-slate-800/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/teacher/results/${attempt.attempt_id}`)}
                       >
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-700">
                                   {attempt.student_name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-white group-hover:text-violet-400 transition-colors">
                                   {attempt.student_name}
                                </span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-sm">
                             {new Date(attempt.attempted_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                             <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getScoreColor(attempt.score)}`}>
                                {attempt.score}%
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <span className="text-sm font-medium text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                                View Analysis <ArrowRight size={14} />
                             </span>
                          </td>
                       </motion.tr>
                    ))
                 ) : (
                    <tr>
                       <td colSpan="4" className="py-12 text-center text-slate-500">
                          {search ? "No students found matching your search." : "No attempts recorded for this quiz yet."}
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
           {filteredAttempts.length > 0 ? (
              filteredAttempts.map((attempt) => (
                 <div 
                    key={attempt.attempt_id}
                    onClick={() => navigate(`/teacher/results/${attempt.attempt_id}`)}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-violet-500/30 transition-all active:scale-95"
                 >
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                             {attempt.student_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <h4 className="font-bold text-white">{attempt.student_name}</h4>
                             <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(attempt.attempted_at).toLocaleDateString()}
                             </p>
                          </div>
                       </div>
                       <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getScoreColor(attempt.score)}`}>
                          {attempt.score}%
                       </span>
                    </div>
                    
                    <button className="w-full py-2 rounded-lg bg-slate-800 text-sm text-slate-300 font-medium hover:bg-slate-700 flex items-center justify-center gap-2">
                       View Analysis <ArrowRight size={14} />
                    </button>
                 </div>
              ))
           ) : (
              <div className="py-12 text-center text-slate-500 bg-slate-900/30 border border-slate-800 rounded-xl">
                 {search ? "No students found." : "No attempts yet."}
              </div>
           )}
        </div>

      </div>
    </div>
  );
}

export default StudentsAttempts;
