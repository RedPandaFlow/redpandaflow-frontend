import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5090/api';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const stored = localStorage.getItem('user');
    if (stored) {
        const { accessToken } = JSON.parse(stored);
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
    }
    return config;
});

let refreshPromise = null;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        const isAuthCall = original?.url?.includes('/auth/');
        if (error.response?.status !== 401 || original?._retry || isAuthCall) {
            return Promise.reject(error);
        }

        original._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = (async () => {
                    const stored = localStorage.getItem('user');
                    if (!stored) throw new Error('No stored user');
                    const { refreshToken } = JSON.parse(stored);
                    const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
                    localStorage.setItem('user', JSON.stringify(data));
                    return data.accessToken;
                })().finally(() => { refreshPromise = null; });
            }

            const accessToken = await refreshPromise;
            original.headers.Authorization = `Bearer ${accessToken}`;
            return api(original);
        } catch (e) {
            localStorage.removeItem('user');
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            return Promise.reject(e);
        }
    }
);

export default api;
