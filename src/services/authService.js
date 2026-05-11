import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/'; 

export const register = (username, email, password, confirmPassword) => {
    return axios.post(API_URL + 'register', { username, email, password, confirmPassword });
};

export const login = async (email, password) => {
    const response = await axios.post(API_URL + 'login', { email, password });
    if (response.data.accessToken) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('user');
};