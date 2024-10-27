import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import FileUpload from './components/FileManagement/FileUpload';
import FileList from './components/FileManagement/FileList';
import UsageAnalytics from './components/Analytics/UsageAnalytics';
import Home from './components/Home';
import UserPage from './components/UserPage';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Homepage */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<FileUpload />} />
        <Route path="/files" element={<FileList />} />
        <Route path="/analytics" element={<UsageAnalytics />} />
        <Route path="/user" element={<UserPage />} />
      </Routes>
    </Router>
  );
};

export default App;
