import api from '../api/axios';

export const getCardMembers = async (workspaceId, boardId, columnId, cardId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}/users`);
    return data;
};

export const assignUserToCard = async (workspaceId, boardId, columnId, cardId, userId) => {
    const { data } = await api.post(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}/users`, { userId });
    return data;
};

export const unassignUserFromCard = async (workspaceId, boardId, columnId, cardId, targetUserId) => {
    const { data } = await api.delete(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}/users/${targetUserId}`);
    return data;
};