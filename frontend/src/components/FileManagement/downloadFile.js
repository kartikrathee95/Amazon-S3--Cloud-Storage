export const downloadFile = async (fileId) => {
    const response = await apiClient.get(`/files/download/${fileId}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `file-${fileId}`); // Set a default filename
    document.body.appendChild(link);
    link.click();
    link.remove();
};
