
import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { BrainCircuit, BookOpen, Clock, FileText, Upload, Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Clock,
    title: "Instant Quiz Generation",
    description: "Create comprehensive quizzes in seconds. Save hours of manual work with our AI engine."
  },
  {
    icon: FileText,
    title: "Multiple Formats",
    description: "Generate from any text, topic, or document. Supports Multiple Choice, True/False, and Short Answer."
  },
  {
    icon: Upload,
    title: "PDF Analysis",
    description: "Upload your study materials or lecture notes (PDF) and let AI extract key questions automatically."
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary-500/20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-400/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] animation-delay-2000" />
        </div>

        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-6 border border-primary-100">
              ✨ The Future of Assessment
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8">
              Generate Quizzes with <br className="hidden md:block" />
              <span className="text-gradient">Artificial Intelligence</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Transform any content into engaging quizzes instantly. Perfect for teachers, students, and lifelong learners.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-primary-500/20">
                  Start Creating for Free
                </Button>
              </Link>
              <Link to="#how-it-works">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  How it Works
                </Button>
              </Link>
            </div>
          </motion.div>
          
          {/* Hero Image Mockup (Abstract representation) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-xl p-2 shadow-2xl">
              <div className="rounded-xl overflow-hidden bg-slate-50 aspect-[16/9] flex items-center justify-center relative border border-slate-100">
                 {/* Placeholder for App Screenshot */}
                 <div className="text-center">
                    <BrainCircuit size={64} className="mx-auto text-primary-300 mb-4" />
                    <p className="text-slate-400 font-medium">Interactive Demo UI</p>
                 </div>
                 
                 {/* Floating Cards */}
                 <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute top-10 right-10 p-4 bg-white rounded-xl shadow-lg border border-slate-100 max-w-xs"
                 >
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <Sparkles size={16} />
                       </div>
                       <div>
                          <p className="text-sm font-semibold text-slate-800">Quiz Generated!</p>
                          <p className="text-xs text-slate-500">20 Questions • Multiple Choice</p>
                       </div>
                    </div>
                 </motion.div>

                 <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-10 left-10 p-4 bg-white rounded-xl shadow-lg border border-slate-100 max-w-xs"
                 >
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <Upload size={16} />
                       </div>
                       <div>
                          <p className="text-sm font-semibold text-slate-800">File Uploaded</p>
                          <p className="text-xs text-slate-500">Lecture_Notes_Ch1.pdf</p>
                       </div>
                    </div>
                 </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to create, manage, and take quizzes efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} hoverEffect className="h-full">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to transform your assessment process?
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join thousands of users creating smarter quizzes with AI today.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-primary-900 hover:bg-slate-100 hover:shadow-white/10">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
