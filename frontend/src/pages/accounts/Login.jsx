import React from 'react';
import LoginForm from '../../components/LoginForm';

function Login() {
  return (
    <div className=''>
      <h1>Login Page</h1>
      <p>Please enter your credentials to log in.</p>
      <LoginForm method="login" route="/accounts/token/" />
      <p>Don't have an account? <a href="/register">Register here</a>.</p>
    </div>
  );
}

export default Login;
