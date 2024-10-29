import React, { useEffect, useState } from 'react';
import { listFiles, setAuthToken, shareFile } from '../../api';
import FileDownload from './FileDownload';
import FileUpload from './FileUpload';

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [sharingFileId, setSharingFileId] = useState(null);
  const [shareUsername, setShareUsername] = useState('');

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

  const handleShare = async (fileId) => {
    if (!shareUsername) {
      alert('Please enter a username or email to share with.');
      return;
    }

    try {
      await shareFile(fileId, { user_id: shareUsername, access_type: "shared" });
      alert('File shared successfully!');
      setShareUsername(''); // Clear the input
      setSharingFileId(null); // Close the share dropdown
      fetchFiles(); // Refresh file list after sharing
    } catch (error) {
      console.error('Error sharing file:', error);
      alert('Failed to share file. Please check the username/email.');
    }
  };

  return (
    <div>
      <h2>File List</h2>
      <FileUpload onUploadSuccess={handleUploadSuccess} />
      {files.length === 0 ? (
        <p>No files available.</p>
      ) : (
        <ul>
          {files.map((file) => (
            <li key={file.file_id}>
              {file.filename}
              <FileDownload fileId={file.file_id} />
              <select
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'share') {
                    setSharingFileId(file.file_id); // Set the file ID to share
                  } else {
                    setSharingFileId(null); // Reset if not sharing
                  }
                }}
              >
                <option value="">Select Action</option>
                <option value="download">Download</option>
                <option value="share">Share</option>
              </select>
              {sharingFileId === file.file_id && (
                <div>
                  <input
                    type="text"
                    placeholder="Enter username or email"
                    value={shareUsername}
                    onChange={(e) => setShareUsername(e.target.value)}
                    required
                  />
                  <button onClick={() => handleShare(file.file_id)}>Share</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileList;
