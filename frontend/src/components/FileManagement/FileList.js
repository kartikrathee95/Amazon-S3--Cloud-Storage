import React, { useEffect, useState } from 'react';
import { listFiles, downloadFile, setAuthToken } from '../../api'; // Import downloadFile

const FileList = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    }

    const fetchFiles = async () => {
      try {
        const response = await listFiles();
        setFiles(response.data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div>
      <h2>File List</h2>
      {files.length === 0 ? (
        <p>No files available.</p>
      ) : (
        <ul>
          {files.map((file) => (
            <li key={file.file_id}>
              {file.filename}
              <button onClick={() => downloadFile(file.file_id)}>Download</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileList;
