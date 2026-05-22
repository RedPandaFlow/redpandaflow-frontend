import api from '../api/axios';

export const search = async (query, limit = 10) => {
    const { data } = await api.get('/search', { params: { q: query, limit } });
    return data;
};
