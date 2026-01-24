import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || '';

export const uploadFile = async (data, { onUploadProgress } = {}) => {
    try {
        const response = await axios.post(`${API_URL}/upload`, data, {
            onUploadProgress,
            headers: { 'Accept': 'application/json' }
        });
        return response.data;
    }
    catch(error) { 
        console.log("Error while calling the api", error.message);
        throw error;
    }
};

export const getFileInfo = async (fileId) => {
    try {
        const response = await axios.get(`${API_URL}/file/${fileId}/info`);
        return response.data;
    }
    catch(error) {
        console.log("Error fetching file info", error.message);
        throw error;
    }
};