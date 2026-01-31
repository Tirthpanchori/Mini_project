import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Trophy, BarChart, Users, Clock, Shield } from "lucide-react";

const BentoItem = ({ title, description, icon: Icon, className, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -5 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.3 }}
    className={`bg-slate-900/50 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800 hover:border-fuchsia-500/50 transition-all duration-300 group shadow-lg hover:shadow-fuchsia-500/20 ${className}`}
  >
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:from-violet-500 group-hover:to-fuchsia-500">
      <Icon className="w-6 h-6 text-fuchsia-400 group-hover:text-white transition-colors" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-fuchsia-300 transition-colors">{title}</h3>
    <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{description}</p>
  </motion.div>
);

const Features = () => {
  return (
    <section id="features" className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
          >
            Everything You Need <br />
            <span className="text-fuchsia-500">To Succeed at Scale</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BentoItem
            title="Structural Mastery"
            description="Expert-curated pathways that guide you from novice to expert without the fluff."
            icon={BookOpen}
            className="md:col-span-2 bg-gradient-to-br from-slate-900 to-violet-900/20"
            delay={0.1}
          />
          <BentoItem
            title="Gamified Progress"
            description="Earn rewards as you conquer new milestones."
            icon={Trophy}
            className="md:col-span-1"
            delay={0.2}
          />
          <BentoItem
            title="Real-time Analytics"
            description="Visualize your learning velocity with enterprise-grade charts."
            icon={BarChart}
            className="md:col-span-1"
            delay={0.3}
          />
          <BentoItem
            title="Global Community"
            description="Join thousands of learners in a collaborative ecosystem."
            icon={Users}
            className="md:col-span-2 bg-gradient-to-bl from-slate-900 to-fuchsia-900/20"
            delay={0.4}
          />
          <BentoItem
            title="Adaptive Schedule"
            description="AI that learns your pace and adjusts content delivery."
            icon={Clock}
            className="md:col-span-1"
            delay={0.5}
          />
          <BentoItem
            title="Enterprise Security"
            description="Your data is encrypted with military-grade standards."
            icon={Shield}
            className="md:col-span-2"
            delay={0.6}
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
