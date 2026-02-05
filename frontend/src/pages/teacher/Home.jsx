import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Layout,
  Users,
  Target,
  Trophy,
  Clock,
  Copy,
  BarChart2,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../services/api";

const HomeT = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      totalQuizzes: 0,
      activeQuizzes: 0,
      totalAttempts: 0,
      avgScore: 0,
    },
    recentQuizzes: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/quiz/teacher/dashboard/");
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("userId");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      label: "Total Quizzes",
      value: data.stats.totalQuizzes,
      icon: BookOpen,
      color: "violet",
      gradient: "from-violet-500 to-indigo-500"
    },
    {
      label: "Active Quizzes",
      value: data.stats.activeQuizzes,
      icon: Target,
      color: "fuchsia",
      gradient: "from-fuchsia-500 to-pink-500"
    },
    {
      label: "Total Attempts",
      value: data.stats.totalAttempts,
      icon: Users,
      color: "cyan",
      gradient: "from-cyan-500 to-teal-500"
    },
    {
      label: "Avg. Score",
      value: `${data.stats.avgScore}%`,
      icon: Trophy,
      color: "amber",
      gradient: "from-amber-500 to-orange-500"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30 p-6 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Teacher</span> 👋
            </h1>
            <p className="text-slate-400">Here's what's happening with your quizzes today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all font-medium flex items-center gap-2 group"
            >
              <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              Logout
            </button>
            <button
              onClick={() => navigate('/recent-teacher-quizzes')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all font-medium flex items-center gap-2"
            >
              <Layout size={18} />
              Recent Quizzes
            </button>
            <Link
              to="/create-quiz"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Plus size={20} strokeWidth={2.5} />
              Create Quiz
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${stat.gradient} blur-2xl rounded-bl-3xl w-24 h-24`} />

              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-${stat.color}-500/30 transition-colors`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                {index === 1 && ( // Only for Active Quizzes as an example
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                    <CheckCircle2 size={12} /> Live
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">{stat.value}</h3>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Quizzes Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="text-violet-400" size={20} />
              Recent Quizzes
            </h2>
            <Link to="/recent-teacher-quizzes" className="text-sm font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1 group">
              View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {data.recentQuizzes.length === 0 ? (
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-slate-500 w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No quizzes yet</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">Create your first quiz to start tracking student progress and gathering insights.</p>
              <Link
                to="/create-quiz"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-200 transition-colors"
              >
                Create Quiz
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.recentQuizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + (index * 0.05) }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-violet-500/10 rounded-xl">
                      <BookOpen className="text-violet-400 w-6 h-6" />
                    </div>

                    <button
                      onClick={() => copyToClipboard(quiz.code)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 hover:text-white hover:border-slate-600 transition-all active:scale-95"
                      title="Copy Code"
                    >
                      {quiz.code}
                      <Copy size={12} />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1" title={quiz.title}>
                    {quiz.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} /> {quiz.timer}m
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layout size={14} /> {quiz.total_questions} Qs
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Users size={14} /> {quiz.attempts_count} Attempts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => navigate(`/teacher/quiz/${quiz.id}/analysis`)}
                      className="px-4 py-2 rounded-lg bg-violet-600/10 text-violet-400 border border-violet-600/20 text-sm font-medium hover:bg-violet-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <BarChart2 size={16} />
                      View Analytics
                    </button>
                  </div>

                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeT;