import React, { useState } from 'react';
import { downloadFile } from '../../api';

const FileDownload = () => {
  const [fileId, setFileId] = useState('');

  const handleDownload = async () => {
    try {
      const response = await downloadFile(fileId);
      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `file_${fileId}`); // You can set the filename here
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('File download failed:', error);
    }
  };

  return (
    <div>
      <h2>Download File</h2>
      <input 
        type="text" 
        value={fileId} 
        onChange={(e) => setFileId(e.target.value)} 
        placeholder="File ID" 
      />
      <button onClick={handleDownload}>Download</button>
    </div>
  );
};

export default FileDownload;
