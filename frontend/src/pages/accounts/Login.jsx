import React from 'react';
import LoginForm from '../../components/LoginForm';

function Login() {
  return (
    <div>
      <h1>Login Page</h1>
      <p>Please enter your credentials to log in.</p>
      <LoginForm method="login" route="/accounts/token/" />
    </div>
  );
}

export default Login;
