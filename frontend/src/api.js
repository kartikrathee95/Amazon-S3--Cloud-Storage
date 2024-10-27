import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/S3';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set the JWT in the Authorization header
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// User Registration
export const registerUser = async (token) => {
  return await apiClient.post('/auth/oauth/register', { token });
};

// User Login
export const loginUser = async (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    return await apiClient.post('/auth/oauth/login', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
};

// File Upload
export const uploadFile = async (file, folderId) => {
  console.log(file)
  console.log("CHILL KARDA")
  const formData = new FormData();
  formData.append('file', file);
  if (folderId) formData.append('folder_id', folderId);
  return await apiClient.post('/files/upload', formData,  
        {headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
}});
};


// Other API calls (download, list files, etc.) can be added similarly...// List Files (with optional parameters)
export const listFiles = async () => {
    const response = await apiClient.get('/files');
    return response;
  };
  
  // Download File
  export const downloadFile = async (fileId) => {
    return await apiClient.get(`/files/download/${fileId}`, { responseType: 'blob' });
  };
  
  // Create Folder
  export const createFolder = async (folderName, parentId) => {
    return await apiClient.post('/folders', { folder_name: folderName, parent_id: parentId });
  };
  
  // List Folders
  export const listFolders = async () => {
    return await apiClient.get('/folders');
  };
  
  // Delete Folder
  export const deleteFolder = async (folderId) => {
    return await apiClient.delete(`/folders/${folderId}`);
  };
  
  export const getUsageAnalytics = async () => {
    return await apiClient.get('/Analytics');
  };