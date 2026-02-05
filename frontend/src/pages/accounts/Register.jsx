import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, CheckCircle2, Sparkles } from 'lucide-react';
import LoginForm from '../../components/LoginForm';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans selection:bg-fuchsia-500/30">
      
      {/* Left Side - Brand Panel */}
      <div className="w-full md:w-1/2 lg:w-[45%] bg-slate-900 border-r border-slate-800 relative hidden md:flex flex-col justify-between p-12 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[100px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px]" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10">
          <div 
             onClick={() => navigate('/')}
             className="flex items-center gap-3 cursor-pointer group w-fit"
          >
            <div className="bg-gradient-to-br from-fuchsia-600 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-fuchsia-500/20 group-hover:scale-105 transition-transform duration-300">
               <BrainCircuit className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              MindArc<span className="text-fuchsia-500">.</span>
            </span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-8">
           <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
             Join the Future <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">
               Of Intelligence
             </span>
           </h1>
           <p className="text-slate-400 text-lg leading-relaxed max-w-md">
             Create your account today and unlock the power of AI-driven learning and assessment.
           </p>

           <div className="space-y-4">
              {[
                "Unlimited Quiz Generation",
                "Advanced Knowledge Graph",
                "Community Challenges"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="p-1 rounded-full bg-fuchsia-500/10 text-fuchsia-400">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-slate-500 text-sm">© 2024 MindArc Inc.</p>
        </div>
      </div>

      {/* Right Side - Auth Card */}
      <div className="w-full md:w-1/2 lg:w-[55%] flex items-center justify-center p-6 relative">
         {/* Mobile Header (Visible only on small screens) */}
         <div className="absolute top-6 left-6 md:hidden">
            <div onClick={() => navigate('/')} className="flex items-center gap-2">
               <BrainCircuit className="h-6 w-6 text-fuchsia-500" />
               <span className="text-xl font-bold text-white">MindArc</span>
            </div>
         </div>

         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="w-full max-w-[480px]"
         >
            {/* Tab Switcher */}
            <div className="bg-slate-900/50 p-1.5 rounded-2xl flex items-center mb-8 border border-slate-800">
               <button 
                 onClick={() => navigate('/login')}
                 className="flex-1 py-2.5 text-sm font-medium rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all text-center"
               >
                 Login
               </button>
               <button 
                 className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white bg-slate-800 shadow-sm border border-slate-700 transition-all text-center"
               >
                 Register
               </button>
            </div>

            {/* Auth Card Content */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
               {/* Decorative Gradient */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500" />
               
               <div className="mb-8">
                 <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                 <p className="text-slate-400">Get started with your free account today.</p>
               </div>

               {/* The Form */}
               <LoginForm method="register" route="/accounts/" />
            </div>

            <p className="text-center text-slate-500 text-sm mt-8">
              By continuing, you agree to our <a href="#" className="text-fuchsia-400 hover:text-fuchsia-300">Terms</a> and <a href="#" className="text-fuchsia-400 hover:text-fuchsia-300">Privacy Policy</a>.
            </p>
         </motion.div>
      </div>

    </div>
  );
}

export default Register;
