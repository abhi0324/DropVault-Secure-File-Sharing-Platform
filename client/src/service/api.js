import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = rawApiUrl.replace(/\/+$/, '');

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor to inject JWT token into all outgoing requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('dropvault_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- Auth APIs ---
export const registerUser = async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
};

export const getMe = async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
};

// --- Upload & File APIs ---
export const uploadFile = async (data, { onUploadProgress } = {}) => {
    try {
        const response = await api.post('/upload', data, {
            onUploadProgress,
            headers: { 'Accept': 'application/json' }
        });
        return response.data;
    } catch(error) { 
        console.error("Upload API Error:", error.response?.data?.msg || error.message);
        throw error;
    }
};

export const getFileInfo = async (fileId) => {
    try {
        const response = await api.get(`/file/${fileId}/info`);
        return response.data;
    } catch(error) {
        console.error("File Info API Error:", error.response?.data?.msg || error.message);
        throw error;
    }
};

// --- Dashboard & User Management APIs ---
export const getUserFiles = async () => {
    const response = await api.get('/api/user/files');
    return response.data;
};

export const toggleRevokeFile = async (fileId) => {
    const response = await api.patch(`/api/user/files/${fileId}/revoke`);
    return response.data;
};

export const deleteUserFile = async (fileId) => {
    const response = await api.delete(`/api/user/files/${fileId}`);
    return response.data;
};

export const getUserStats = async () => {
    const response = await api.get('/api/user/stats');
    return response.data;
};

export default api;