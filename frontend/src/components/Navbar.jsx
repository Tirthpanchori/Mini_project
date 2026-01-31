import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { Menu, X, BrainCircuit, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md border-b border-slate-200/50 py-3 shadow-sm"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-6">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary-600 p-2 rounded-xl text-white transform group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-primary-500/30">
                <BrainCircuit size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                MindArc<span className="text-fuchsia-500">.</span>
              </span>
            </Link>

            {/* Desktop Menu */}
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
                  className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-500"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </nav>
        </div>
      </header>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-4 mt-8 size-full">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full justify-center"
                  >
                    Log in
                  </Button>
                </Link>

                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="md" className="w-full justify-center">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
