import api from '../api/axios';

export const getBoards = async (workspaceId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/boards`);
    return data;
};

export const getBoard = async (workspaceId, boardId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/boards/${boardId}`);
    return data;
};

export const createBoard = async (workspaceId, payload) => {
    const { data } = await api.post(`/workspaces/${workspaceId}/boards`, payload);
    return data;
};

export const updateBoard = async (workspaceId, boardId, payload) => {
    const { data } = await api.put(`/workspaces/${workspaceId}/boards/${boardId}`, payload);
    return data;
};

export const deleteBoard = async (workspaceId, boardId) => {
    await api.delete(`/workspaces/${workspaceId}/boards/${boardId}`);
};

export const getColumns = async (workspaceId, boardId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/boards/${boardId}/columns`);
    return data;
};

export const createColumn = async (workspaceId, boardId, payload) => {
    const { data } = await api.post(`/workspaces/${workspaceId}/boards/${boardId}/columns`, payload);
    return data;
};

export const updateColumn = async (workspaceId, boardId, columnId, payload) => {
    const { data } = await api.put(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`, payload);
    return data;
};

export const deleteColumn = async (workspaceId, boardId, columnId) => {
    await api.delete(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`);
};
