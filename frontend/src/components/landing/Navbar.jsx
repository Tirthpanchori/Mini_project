import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <nav
        className={`w-full max-w-5xl rounded-full transition-all duration-300 border ${
          scrolled || isOpen
            ? "bg-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-black/20"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer group" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="bg-indigo-600 p-1.5 rounded-lg mr-2 group-hover:bg-indigo-500 transition-colors">
                <BrainCircuit className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                MindArc
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1 bg-slate-800/50 rounded-full p-1 border border-slate-700/50">
              {[
                { label: "Home", action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
                { label: "Features", action: () => scrollToSection("features") },
                { label: "About", action: () => scrollToSection("about") },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="relative px-5 py-2 text-sm font-medium rounded-full text-slate-300 hover:text-white transition-colors group overflow-hidden"
                >
                  <span className="relative z-10">{item.label}</span>
                  <motion.div
                    className="absolute inset-0 bg-slate-700"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                  />
                </button>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={() => navigate("/login")}
                className="relative px-5 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white transition-colors overflow-hidden group"
              >
                <span className="relative z-10">Log In</span>
                <motion.div
                  className="absolute inset-0 bg-slate-800"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                />
              </button>
              <button
                onClick={() => navigate("/register")}
                className="relative px-5 py-2 rounded-full text-sm font-medium text-slate-900 overflow-hidden group"
              >
                <span className="relative z-10 font-bold group-hover:text-white transition-colors duration-300">Get Started</span>
                <div className="absolute inset-0 bg-white" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white p-1"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-slate-800"
            >
              <div className="px-6 py-4 space-y-3">
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setIsOpen(false);
                  }}
                  className="block w-full text-left py-2 text-base font-medium text-slate-300 hover:text-white"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="block w-full text-left py-2 text-base font-medium text-slate-300 hover:text-white"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="block w-full text-left py-2 text-base font-medium text-slate-300 hover:text-white"
                >
                  About Us
                </button>
                
                <div className="pt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full px-4 py-2 text-center rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="w-full px-4 py-2 text-center rounded-lg text-sm font-medium text-slate-900 bg-white hover:bg-gray-100 transition-all"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
};

export default Navbar;
