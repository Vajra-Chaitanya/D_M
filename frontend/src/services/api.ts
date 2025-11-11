import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const api = {
  healthCheck: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    return response.data;
  },

  processQuery: async (query: string, context: Record<string, any> = {}) => {
    const response = await axios.post(`${API_BASE_URL}/api/query`, {
      query,
      context,
    });
    return response.data;
  },

  parsePdf: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_BASE_URL}/api/parse-pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  listTools: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/tools`);
    return response.data;
  },
};

export default api;
