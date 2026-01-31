import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex Rivera",
    role: "Frontend Developer",
    content: "MindArc completely transformed how I approach learning. The bento-style modules are intuitive.",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
  },
  {
    name: "Sarah Chen",
    role: "Data Scientist",
    content: "The analytics are next level. I can actually see where I'm improving day by day.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
  },
  {
    name: "James Wilson",
    role: "Student",
    content: "Finally, a platform that feels like it was built for the 21st century. Dark mode is a lifesaver.",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
  },
  {
    name: "Elena Rodriguez",
    role: "UX Designer",
    content: "The gamification is subtle but effective. It keeps me coming back without feeling cringey.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
  },
  {
    name: "Michael Chang",
    role: "Product Manager",
    content: "MindArc allows my team to upskill rapidly. The enterprise security features are top notch.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-slate-950 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-slate-950 to-transparent z-10" />
      <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-slate-950 to-transparent z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-white tracking-tight">
          Join 10,000+ <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Pioneers</span>
        </h2>
      </div>

      <div className="flex overflow-hidden group">
        <div className="flex space-x-6 animate-marquee pause-on-hover w-max">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div 
              key={i} 
              className="w-[350px] flex-shrink-0 bg-gradient-to-br from-slate-900 to-violet-950/30 border border-slate-700/50 p-7 rounded-2xl hover:border-fuchsia-500 transition-colors relative shadow-xl"
            >
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-fuchsia-500/20 rounded-full blur-lg" />
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed font-light">"{t.content}"</p>
              <div className="flex items-center space-x-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full border border-slate-700" />
                <div>
                  <h4 className="text-white font-medium text-sm">{t.name}</h4>
                  <span className="text-slate-500 text-xs">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
