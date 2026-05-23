import axios from 'axios';
import { getBoardConnectionId } from '../services/signalrClient';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5090/api';

const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const connectionId = getBoardConnectionId();
    if (connectionId) {
        config.headers['X-Connection-Id'] = connectionId;
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
                refreshPromise = axios
                    .post(`${baseURL}/auth/refresh`, null, { withCredentials: true })
                    .finally(() => { refreshPromise = null; });
            }

            await refreshPromise;
            return api(original);
        } catch (e) {
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
            return Promise.reject(e);
        }
    }
);

export default api;
