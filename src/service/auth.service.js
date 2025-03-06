import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/users'; 

const UserService = {
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    verifyOtp: async (otpData) => {
        try {
            const response = await axios.post(`${API_URL}/verify-otp`, otpData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    login: async (credentials) => {
        try {
            const response = await axios.post(`${API_URL}/login`, credentials);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    refreshToken: async () => {
        try {
            const response = await axios.get(`${API_URL}/refresh-token`, { withCredentials: true });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    logout: async () => {
        try {
            const response = await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },
};

export default UserService;