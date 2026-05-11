import api from '../api/axios';

export const register = async (username, email, password, confirmPassword) => {
    const { data } = await api.post('/auth/register', { username, email, password, confirmPassword });
    return data;
};

export const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.accessToken) {
        localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
};

export const logout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('user');
};
