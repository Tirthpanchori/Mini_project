import React from 'react';
import LoginForm from '../../components/LoginForm';

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-100 p-6">
      <div className="w-full max-w-md bg-white border border-blue-200 shadow-xl rounded-2xl p-8 text-center 
                      transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(59,130,246,0.25)]">
        
        <h1 className="text-3xl font-semibold text-blue-700 mb-2">Create an Account</h1>
        <p className="text-slate-600 mb-6">Please fill in your details to register.</p>

        <LoginForm method="register" route="/accounts/" />

        <p className="text-sm text-slate-600 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-medium hover:underline hover:text-blue-800">
            Login here
          </a>.
        </p>
      </div>
    </div>
  );
}

export default Register;
