import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-indigo-600/5 blur-[100px]" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-b from-slate-900 to-violet-950/50 border border-slate-800 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden"
        >
          {/* Decorative blobs inside card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full" />

          <span className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-8 relative z-10">
            <Sparkles className="w-4 h-4 mr-2" />
            Limited Time Access
          </span>
          
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8 leading-tight relative z-10">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">Ascend?</span>
          </h2>
          
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto relative z-10">
            Join the educational revolution. No credit card required for the first 14 days. Start building your future today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center group transform hover:-translate-y-1"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              className="px-8 py-4 rounded-full bg-slate-950/50 text-white text-lg font-medium border border-slate-700 hover:bg-slate-900 transition-all hover:border-indigo-500/50"
            >
              Contact Sales
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
