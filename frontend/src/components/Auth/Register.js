import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, setAuthToken } from '../../api';
import './Register.css'; // Import the CSS file for styling

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await registerUser({ username, email, password });
      if (response) {
        setAuthToken(response.jwt);
        localStorage.setItem('token', response.access_token);
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setErrorMessage('Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleRegister}>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username" 
          required 
          className="input-box"
        />
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          required 
          className="input-box"
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
          className="input-box"
        />
        <button type="submit" className="submit-button">Register</button>
      </form>
    </div>
  );
};

export default Register;
