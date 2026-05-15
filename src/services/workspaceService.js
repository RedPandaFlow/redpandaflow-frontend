import api from '../api/axios';

export const getWorkspaces = async () => {
    const { data } = await api.get('/workspaces');
    return data;
};

export const getWorkspace = async (id) => {
    const { data } = await api.get(`/workspaces/${id}`);
    return data;
};

export const createWorkspace = async (payload) => {
    const { data } = await api.post('/workspaces', payload);
    return data;
};

export const updateWorkspace = async (id, payload) => {
    const { data } = await api.put(`/workspaces/${id}`, payload);
    return data;
};

export const deleteWorkspace = async (id) => {
    await api.delete(`/workspaces/${id}`);
};

export const getMembers = async (id) => {
    const { data } = await api.get(`/workspaces/${id}/members`);
    return data;
};

export const inviteMember = async (id, payload) => {
    const { data } = await api.post(`/workspaces/${id}/members`, payload);
    return data;
};

export const updateMemberRole = async (id, userId, role) => {
    const { data } = await api.put(`/workspaces/${id}/members/${userId}`, { role });
    return data;
};

export const removeMember = async (id, userId) => {
    await api.delete(`/workspaces/${id}/members/${userId}`);
};
