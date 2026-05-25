import api from '../api/axios';

export const getBoardLabels = async (workspaceId, boardId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/boards/${boardId}/labels`);
    return data;
};

export const createBoardLabel = async (workspaceId, boardId, name, color) => {
    const { data } = await api.post(`/workspaces/${workspaceId}/boards/${boardId}/labels`, { name, color });
    return data;
};

export const deleteBoardLabel = async (workspaceId, boardId, labelId) => {
    const { data } = await api.delete(`/workspaces/${workspaceId}/boards/${boardId}/labels/${labelId}`);
    return data;
};

export const getCardLabels = async (workspaceId, boardId, columnId, cardId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}/labels`);
    return data;
};

export const assignLabelToCard = async (workspaceId, boardId, columnId, cardId, labelId) => {
    const { data } = await api.post(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}/labels`, { labelId });
    return data;
};

export const unassignLabelFromCard = async (workspaceId, boardId, columnId, cardId, labelId) => {
    const { data } = await api.delete(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}/labels/${labelId}`);
    return data;
};