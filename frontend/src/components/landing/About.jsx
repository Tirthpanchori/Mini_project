import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-600/10 rounded-2xl transform rotate-3"></div>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Team working together"
                className="relative rounded-2xl shadow-2xl w-full object-cover h-[500px]"
              />
            </div>
          </motion.div>

          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                About MindArc
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                MindArc was born from a simple idea: that education should be accessible, engaging, and effective for everyone. We believe in the power of technology to transform the way we learn and grow.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Our mission is to empower students and educators alike with world-class tools and resources. Whether you're looking to master a new skill or manage a classroom, MindArc is here to support your journey.
              </p>

              <div className="space-y-4">
                {[
                  "Expert-led course material",
                  "Interactive learning environment",
                  "Real-time progress tracking",
                  "24/7 student support"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
