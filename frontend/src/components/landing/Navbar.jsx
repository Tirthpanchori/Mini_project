import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-lg py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <BrainCircuit className={`h-8 w-8 ${scrolled ? "text-indigo-600" : "text-white"} mr-2`} />
            <span className={`font-bold text-2xl tracking-tighter ${scrolled ? "text-slate-900" : "text-white"}`}>
              MindArc
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`text-sm font-medium transition-colors hover:text-indigo-500 ${
                scrolled ? "text-slate-700" : "text-white/90"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className={`text-sm font-medium transition-colors hover:text-indigo-500 ${
                scrolled ? "text-slate-700" : "text-white/90"
              }`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className={`text-sm font-medium transition-colors hover:text-indigo-500 ${
                scrolled ? "text-slate-700" : "text-white/90"
              }`}
            >
              About Us
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => navigate("/login")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                scrolled
                  ? "text-indigo-600 hover:bg-indigo-50"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/register")}
              className={`px-5 py-2 rounded-full text-sm font-medium shadow-lg transition-all transform hover:scale-105 ${
                scrolled
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30"
                  : "bg-white text-indigo-900 hover:bg-gray-100"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`${scrolled ? "text-slate-900" : "text-white"} focus:outline-none`}
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
            className="md:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-3 text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left px-3 py-3 text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="block w-full text-left px-3 py-3 text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
              >
                About Us
              </button>
              <div className="pt-4 flex flex-col space-y-3 px-3">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full px-5 py-3 text-center rounded-lg text-base font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="w-full px-5 py-3 text-center rounded-lg text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-md"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
