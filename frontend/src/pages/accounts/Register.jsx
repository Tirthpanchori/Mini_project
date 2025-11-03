import React from 'react';
import LoginForm from '../../components/LoginForm';

function Register() {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center'>
        <h1 className='text-3xl font-bold mb-2'>Register Page</h1>
        <p className='text-gray-600'>Please fill in the form to create an account.</p>
        <LoginForm method="register" route="/accounts/" />
      </div>
    </div>
  );
}

export default Register;
