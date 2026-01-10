
import React from 'react';
import LoginForm from '../../components/LoginForm';
import { Navbar } from '../../components/layout/Navbar';

function Register() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 pt-20">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-8 relative overflow-hidden">
           {/* Decorative background blobs */}
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-400/10 rounded-full blur-3xl pointer-events-none" />
           <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

           <LoginForm method="register" route="/accounts/" />
        </div>
      </div>
    </div>
  );
}

export default Register;
