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
        console.log("Error whlile calling the api", error.message);
        throw error;
    }
};