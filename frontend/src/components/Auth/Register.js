import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, setAuthToken } from '../../api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    try {

      console.log("jwere");
      const response = await registerUser({ username, email, password });
      setAuthToken(response.data.jwt); // Save JWT in local storage or context
      localStorage.setItem('token', response.data.access_token);
      console.log("jwere");

      navigate('/login');
      console.log("jwere");

    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input 
        type="text" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        placeholder="Username" 
      />
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email" 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password" 
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Register;
