import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, ArrowUpRight, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-950 pt-24 pb-12 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24">
          <div>
            <span className="text-violet-400 font-mono text-sm mb-4 block">Let's build together</span>
            <h2 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.8]">
              MindArc<span className="text-fuchsia-500">.</span>
            </h2>
          </div>
          <div className="mt-8 md:mt-0 flex gap-4">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-violet-600 hover:border-violet-600 transition-all">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4">
              {['Features', 'Pricing', 'Enterprise', 'Changelog'].map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-fuchsia-400 transition-colors flex items-center group">
                    {item}
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4">
              {['About', 'Careers', 'Blog', 'Contact'].map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-fuchsia-400 transition-colors flex items-center group">
                    {item}
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Resources</h4>
            <ul className="space-y-4">
              {['Documentation', 'Community', 'Help Center', 'API Status'].map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-fuchsia-400 transition-colors flex items-center group">
                    {item}
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-900">
          <p className="text-slate-600 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} MindArc Inc. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
