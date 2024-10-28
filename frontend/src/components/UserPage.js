// src/components/UserPage.js
import React, { useEffect, useState } from 'react';
import { listFiles, setAuthToken } from '../api'; // Your API functions
import FileUpload from './FileManagement/FileUpload';
import FileList from './FileManagement/FileList';

const UserPage = () => {
    const [files, setFiles] = useState([]);

    const fetchFiles = async () => {
        try {
            const filesData = await listFiles(); // Fetch user's files
            setFiles(filesData);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token);
        }

        fetchFiles(); // Call fetchFiles initially
    }, []);

    return (
        <div>
            <h1>Your Files</h1>
            <FileList files={files} />
        </div>
    );
};

export default UserPage;
