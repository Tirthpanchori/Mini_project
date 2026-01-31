import React from "react";
import { motion } from "framer-motion";
import { Users, Globe, Award, Sparkles } from "lucide-react";

const StatsCard = ({ icon: Icon, value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="bg-slate-900/80 border border-slate-700/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center group hover:border-cyan-500/50 transition-colors hover:bg-slate-800 hover:shadow-lg hover:shadow-cyan-500/20"
  >
    <div className="w-12 h-12 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-full flex items-center justify-center mb-4 group-hover:from-violet-500 group-hover:to-cyan-500 transition-all duration-300">
      <Icon className="w-6 h-6 text-violet-400 group-hover:text-white transition-colors" />
    </div>
    <span className="text-3xl font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">{value}</span>
    <span className="text-sm text-slate-500 uppercase tracking-widest group-hover:text-slate-300">{label}</span>
  </motion.div>
);

const About = () => {
  return (
    <section id="about" className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          
          {/* Content Side */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-sm font-medium mb-6">
                <Globe className="w-4 h-4 mr-2" />
                Our Mission
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
                Democratizing <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
                  Elite Education
                </span>
              </h2>
              
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                We believe that intelligence is evenly distributed, but opportunity is not. 
                MindArc exists to tip the scales. We are building the infrastructure for the 
                next generation of problem solvers, creators, and leaders.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <StatsCard icon={Users} value="50K+" label="Active Learners" delay={0.2} />
                <StatsCard icon={Award} value="120+" label="Certified Experts" delay={0.3} />
                <StatsCard icon={Globe} value="85" label="Countries" delay={0.4} />
                <StatsCard icon={Sparkles} value="4.9/5" label="User Rating" delay={0.5} />
              </div>
            </motion.div>
          </div>

          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/80 to-transparent mix-blend-multiply z-10 transition-opacity duration-700 group-hover:opacity-0" />
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
                alt="Team working together"
                className="w-full h-[600px] object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              />
            </div>

            {/* Decorative background elements */}
            <div className="absolute -z-10 top-10 -right-10 w-full h-full border-2 border-slate-800 rounded-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
