import React from 'react';
import LoginForm from '../../components/LoginForm';

function Register() {
  return (
    <div className=''>
      <h1>Register Page</h1>
      <p>Please fill in the form to create an account.</p>
      <LoginForm method="register" route="/accounts/" />
    </div>
  );
}

export default Register;
