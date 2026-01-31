import React, { useEffect } from "react";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import About from "../components/landing/About";
import Testimonials from "../components/landing/Testimonials";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

const LandingPage = () => {
  // Ensure we start at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <About />
      {/* <Testimonials /> */}
     <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
