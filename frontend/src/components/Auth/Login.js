// src/components/Auth/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, setAuthToken } from '../../api';
import './Login.css';

const Login = ({ onSwitch }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          const response = await loginUser(username, password);
          setAuthToken(response.data.access_token);
          localStorage.setItem('token', response.data.access_token);
          navigate('/user');
      } catch (error) {
          console.error("Login failed:", error);
      }
  };

  return (
      <div className="container">
          <h1>Login</h1>
          <form onSubmit={handleSubmit}>
              <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
              />
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
              />
              <button type="submit">Login</button>
              <p>
                  Don't have an account? <button type="button" onClick={onSwitch}>Register</button>
              </p>
          </form>
      </div>
  );
};

export default Login;
