import React, { useEffect, useState } from 'react';
import { listFiles, setAuthToken } from '../../api';
import FileDownload from './FileDownload';
import FileUpload from './FileUpload';

const FileList = () => {
  const [files, setFiles] = useState([]);

  // Function to fetch files from the API
  const fetchFiles = async () => {
    try {
      const response = await listFiles();
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token); // Set the token for API requests
    }

    fetchFiles(); // Fetch files on component mount
  }, []); // Run only once on mount

  // This function will be called after a successful upload
  const handleUploadSuccess = () => {
    fetchFiles(); // Refresh the file list after upload
  };

  return (
    <div>
      <h2>File List</h2>
      <FileUpload onUploadSuccess={handleUploadSuccess} /> {/* Ensure this is only here once */}
      {files.length === 0 ? (
        <p>No files available.</p>
      ) : (
        <ul>
          {files.map((file) => (
            <li key={file.file_id}>
              {file.filename}
              <FileDownload fileId={file.file_id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileList;
