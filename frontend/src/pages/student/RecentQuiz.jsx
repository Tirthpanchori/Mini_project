import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Clock, 
  ArrowRight,
  BookOpen,
  ArrowLeft,
  Trophy,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

function RecentQuizzes() {
  const [attempts, setAttempts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortUser, setSortUser] = useState("newest"); // "newest", "oldest", "score_high", "score_low"
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await api.get("/attempts/recent-quizzes/");
        setAttempts(res.data);
      } catch (error) {
        console.error("Error fetching recent quizzes:", error);
      }
    };
    fetchAttempts();
  }, []);

  // Filter & Sort Logic
  const filteredAttempts = useMemo(() => {
    let filtered = attempts.filter(a => 
      a.quiz.title.toLowerCase().includes(search.toLowerCase())
    );

    if (sortUser === "newest") {
      filtered.sort((a, b) => new Date(b.attempted_at) - new Date(a.attempted_at));
    } else if (sortUser === "oldest") {
      filtered.sort((a, b) => new Date(a.attempted_at) - new Date(b.attempted_at));
    } else if (sortUser === "score_high") {
      filtered.sort((a, b) => b.score - a.score);
    } else if (sortUser === "score_low") {
      filtered.sort((a, b) => a.score - b.score);
    }
    
    return filtered;
  }, [attempts, search, sortUser]);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30 p-6 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <button 
          onClick={() => navigate('/student')}
          className="text-slate-500 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors mb-2"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
             <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
               <BookOpen className="text-violet-500" size={32} />
               My <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Attempts</span>
             </h1>
             <p className="text-slate-400">Review your past performance and analyze your results.</p>
           </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 bg-slate-900/40 p-2 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
             <input 
               type="text" 
               placeholder="Search by quiz title..." 
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
               className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 outline-none focus:border-violet-500/50 appearance-none cursor-pointer"
             >
               <option value="newest">Newest First</option>
               <option value="oldest">Oldest First</option>
               <option value="score_high">Highest Score</option>
               <option value="score_low">Lowest Score</option>
             </select>
           </div>
        </div>

        {/* Attempts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <AnimatePresence>
             {filteredAttempts.length > 0 ? (
               filteredAttempts.map((attempt, i) => (
                 <motion.div
                   key={attempt.id}
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   transition={{ delay: i * 0.05 }}
                   className="group bg-slate-900 border border-slate-800 hover:border-violet-500/30 rounded-2xl p-6 relative overflow-hidden transition-all hover:shadow-xl hover:shadow-violet-500/10"
                 >
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10">
                       <div className="flex justify-between items-start mb-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getScoreColor(attempt.score)}`}>
                             Score: {attempt.score}%
                          </span>
                          
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
                             <Clock size={10} />
                             {new Date(attempt.attempted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                       </div>

                       <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-violet-400 transition-colors">
                         {attempt.quiz.title}
                       </h3>

                       <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                          <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(attempt.attempted_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Trophy size={14} /> Result Available</span>
                       </div>

                       <button 
                         onClick={() => navigate(`/result/${attempt.id}`)}
                         className="w-full py-2.5 rounded-xl bg-violet-600/10 border border-violet-600/20 text-violet-400 font-medium hover:bg-violet-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                       >
                         View Analysis 
                         <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                       </button>
                    </div>
                 </motion.div>
               ))
             ) : (
                <div className="col-span-full py-20 text-center">
                   <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                      <Search className="text-slate-600 w-8 h-8" />
                   </div>
                   <h3 className="text-lg font-medium text-white">No attempts found</h3>
                   <p className="text-slate-500">Try attempting a new quiz from the dashboard.</p>
                </div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default RecentQuizzes;
