// src/components/FileManagement/FileUpload.js
import React, { useState } from 'react';
import { uploadFile } from '../../api';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [folderId, setFolderId] = useState('');

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            console.error('No file selected');
            return;
        }

        try {
            await uploadFile(file, folderId ? folderId : null);
            console.log('File uploaded successfully');
            onUploadSuccess(); // Call the function to refresh the file list
        } catch (error) {
            console.error('File upload failed:', error.response ? error.response.data : error);
        }
    };

    return (
        <div>
            <h2>Upload File</h2>
            <form onSubmit={handleUpload}>
                <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files[0])} 
                />
                <input 
                    type="text" 
                    value={folderId} 
                    onChange={(e) => setFolderId(e.target.value)} 
                    placeholder="Folder ID (optional)" 
                />
                <button type="submit">Upload</button>
            </form>
        </div>
    );
};

export default FileUpload;
