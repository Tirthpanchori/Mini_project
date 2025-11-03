import React from 'react';
import LoginForm from '../../components/LoginForm';

function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-2 ">Login Page</h1>
        <p className=" text-gray-600">Please enter your credentials to log in.</p>
        <LoginForm method="login" route="/accounts/token/" />
        <p className=" text-gray-600">
          Don't have an account?{" "}
          <a href="/register/" className="text-blue-600 hover:underline font-medium">
            Register here
          </a>.
        </p>
      </div>
    </div>
  );
}

export default Login;
