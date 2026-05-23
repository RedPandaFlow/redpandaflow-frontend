import api from '../api/axios';

export const register = async (username, email, password, confirmPassword) => {
    const { data } = await api.post('/auth/register', { username, email, password, confirmPassword });
    return data;
};

export const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
};

export const me = async () => {
    const { data } = await api.get('/auth/me');
    return data;
};

export const logout = async () => {
    await api.post('/auth/logout').catch(() => undefined);
};
