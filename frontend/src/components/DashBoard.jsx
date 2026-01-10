
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "./layout/Navbar";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Plus, Play, History, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", role: "", id: "" });

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("name") || localStorage.getItem("username"); // Fallback check
    const storedId = localStorage.getItem("userId");

    setUser({
      name: storedName || "User",
      role: storedRole || "student",
      id: storedId || "",
    });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
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

  const isTeacher = user.role === "teacher";

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      <main className="container mx-auto px-6 pt-32 pb-12">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, <span className="text-primary-600">{user.name}</span> 👋
            </h1>
            <p className="text-slate-500 mt-2">
              {isTeacher 
                ? "Manage your quizzes and track student progress." 
                : "Ready to test your knowledge today?"}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
              <User size={16} className="text-primary-500" />
              <span className="capitalize">{user.role} Account</span>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Main Action Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              hoverEffect 
              className="h-full border-l-4 border-l-primary-500 cursor-pointer group"
              onClick={handleQuizAction}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 transition-transform">
                {isTeacher ? <Plus size={28} /> : <Play size={28} />}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">
                {isTeacher ? "Create New Quiz" : "Join a Quiz"}
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {isTeacher
                  ? "Generate a quiz using AI, upload a PDF, or create one manually."
                  : "Enter a quiz code shared by your instructor to start attempting."}
              </p>
              <div className="flex items-center text-primary-600 font-semibold text-sm">
                <span>{isTeacher ? "Start Creating" : "Join Now"}</span>
                <motion.span className="ml-2 group-hover:translate-x-1 transition-transform">
                  →
                </motion.span>
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              hoverEffect 
              className="h-full cursor-pointer group"
              onClick={handleRecentQuizzes}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <History size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                Recent Activity
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {isTeacher
                  ? "View performance analytics and results for your quizzes."
                  : "Review your past quiz attempts and check your scores."}
              </p>
              <div className="flex items-center text-blue-600 font-semibold text-sm">
                <span>View History</span>
                <motion.span className="ml-2 group-hover:translate-x-1 transition-transform">
                  →
                </motion.span>
              </div>
            </Card>
          </motion.div>

          {/* Stats/Placeholder Card (Optional enhancement) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
             <Card className="h-full bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="relative z-10">
                   <h3 className="text-lg font-bold mb-2">Pro Tip</h3>
                   <p className="text-slate-300 text-sm mb-6">
                      Did you know you can generate quizzes directly from your lecture notes? Try the PDF upload feature!
                   </p>
                   {isTeacher && (
                     <Button size="sm" variant="glass" onClick={() => navigate('/create-quiz')}>
                        Try it out
                     </Button>
                   )}
                </div>
             </Card>
          </motion.div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
