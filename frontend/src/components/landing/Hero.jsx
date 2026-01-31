import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, PlayCircle, BrainCircuit } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center overflow-hidden bg-slate-950 pt-20">
      {/* Immersive Background - Vibrant Mix */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/30 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-500/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Text Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 text-sm font-medium mb-8 backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>The Future of Learning is Here</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[1]"
            >
              Master <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400">
                Your Craft
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light"
            >
              MindArc bridges the gap between ambition and mastery. 
              An intelligent ecosystem designed for the modern creator.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-4 rounded-full bg-white text-slate-950 font-bold text-lg hover:bg-fuchsia-50 transition-all flex items-center justify-center group shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(232,121,249,0.5)]"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 rounded-full border border-slate-700 bg-slate-900/50 text-slate-300 font-medium text-lg hover:bg-slate-800 hover:text-white hover:border-fuchsia-500/50 transition-all flex items-center justify-center backdrop-blur-sm"
              >
                <PlayCircle className="mr-2 w-5 h-5" />
                Demo
              </button>
            </motion.div>
          </div>

          {/* Visual Content (Knowledge Engine) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="lg:w-1/2 relative perspective-1000"
          >
            {/* Main Container */}
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 shadow-2xl p-8 backdrop-blur-xl overflow-hidden group">
              
              {/* Animated Background Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(167,139,250,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(167,139,250,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

              {/* Analytics Dashboard Hub */}
              <div className="relative z-10 flex flex-col items-center justify-center min-h-[350px] w-full px-4">
                
                {/* Top Row: Floating Analysis Cards */}
                <div className="grid grid-cols-2 gap-4 w-full mb-6">
                  
                  {/* Card 1: Performance Graph */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs text-slate-400 font-medium">Performance Trend</span>
                      <span className="text-xs text-fuchsia-400 font-bold">+24.5%</span>
                    </div>
                    {/* Simulated Line Graph */}
                    <div className="relative h-24 w-full flex items-end justify-between px-1">
                      <svg className="absolute inset-0 w-full h-full overflow-visible">
                        <motion.path
                          d="M0 60 C 20 50, 40 70, 60 40 S 100 20, 140 30 S 180 10, 220 5"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#c026d3" /> {/* Fuchsia */}
                            <stop offset="100%" stopColor="#22d3ee" /> {/* Cyan */}
                          </linearGradient>
                        </defs>
                        {/* Area under curve */}
                        <motion.path
                          d="M0 60 C 20 50, 40 70, 60 40 S 100 20, 140 30 S 180 10, 220 5 V 100 H 0 Z"
                          fill="url(#gradientArea)"
                          stroke="none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.2 }}
                          transition={{ delay: 1, duration: 1 }}
                        />
                         <defs>
                          <linearGradient id="gradientArea" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#c026d3" />
                            <stop offset="100%" stopColor="transparent" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Interactive Datapoints */}
                      {[1,2,3,4].map((_, i) => (
                        <motion.div 
                          key={i}
                          className="w-2 h-2 rounded-full bg-white relative z-10 shadow-[0_0_10px_white]"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1.5 + (i * 0.2) }}
                          style={{
                           top: [10, -10, 0, -20][i], // Approximate positions matching curve
                           position: 'relative'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Card 2: Skill Distribution Pie (Donut) */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 backdrop-blur-md flex flex-col items-center justify-center relative">
                     <span className="text-xs text-slate-400 font-medium absolute top-4 left-4">Skill Mastery</span>
                     <div className="relative w-32 h-32 mt-4">
                        <svg viewBox="0 0 100 100" className="rotate-[-90deg]">
                          {/* Background Circle */}
                          <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="12" fill="none" />
                          {/* Segment 1 */}
                          <motion.circle
                            cx="50" cy="50" r="40"
                            stroke="#a78bfa" strokeWidth="12" fill="none"
                            strokeDasharray="251.2"
                            strokeDashoffset="251.2"
                            animate={{ strokeDashoffset: 100 }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                            strokeLinecap="round"
                          />
                          {/* Segment 2 */}
                          <motion.circle
                            cx="50" cy="50" r="40"
                            stroke="#e879f9" strokeWidth="12" fill="none"
                            strokeDasharray="251.2"
                            strokeDashoffset="251.2"
                            animate={{ strokeDashoffset: 210 }} 
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                             strokeLinecap="round"
                             className="opacity-80"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                          <span className="text-2xl font-bold">85%</span>
                          <span className="text-[10px] text-slate-400">MASTERY</span>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Bottom Row: Detailed Metrics */}
                <div className="w-full bg-slate-900/40 rounded-xl p-3 border border-white/5 flex justify-around items-center">
                  {[
                    { label: "Accuracy", value: "92%", color: "text-cyan-400" },
                    { label: "Speed", value: "1.2s", color: "text-fuchsia-400" },
                    { label: "Retention", value: "High", color: "text-violet-400" }
                  ].map((stat, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                      <span className="text-xs text-slate-500 uppercase">{stat.label}</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Decorative Elements */}
               <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute top-8 left-8 p-3 rounded-lg bg-slate-800/90 border border-slate-700 shadow-lg backdrop-blur-sm"
              >
                <div className="w-8 h-1 bg-slate-600 rounded-full mb-1" />
                <div className="w-5 h-1 bg-slate-700 rounded-full" />
              </motion.div>

              <motion.div 
                animate={{ y: [10, -10, 10] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-12 right-8 p-3 rounded-lg bg-slate-800/90 border border-slate-700 shadow-lg backdrop-blur-sm flex items-center gap-2"
              >
                <div className="w-3 h-3 rounded-full bg-fuchsia-500" />
                <div className="w-12 h-1 bg-slate-400 rounded-full" />
              </motion.div>

            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
