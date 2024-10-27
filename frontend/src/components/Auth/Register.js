import React, { useState } from 'react';
import { registerUser, setAuthToken } from '../../api';

const Register = () => {
  const [token, setToken] = useState('');

  const handleRegister = async () => {
    try {
      const response = await registerUser(token);
      setAuthToken(response.data.jwt); // Save JWT in local storage or context
      // Redirect to file list or dashboard
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input 
        type="text" 
        value={token} 
        onChange={(e) => setToken(e.target.value)} 
        placeholder="OAuth2 Token" 
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Register;
