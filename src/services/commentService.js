import api from '../api/axios';

export const getCardComments = async (workspaceId, boardId, columnId, cardId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}/comments`);
    return data;
};

export const addComment = async (workspaceId, boardId, columnId, cardId, content) => {
    const { data } = await api.post(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}/comments`, { content });
    return data;
};

export const updateComment = async (workspaceId, boardId, columnId, cardId, commentId, content) => {
    const { data } = await api.put(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}/comments/${commentId}`, { content });
    return data;
};

export const deleteComment = async (workspaceId, boardId, columnId, cardId, commentId) => {
    const { data } = await api.delete(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}/comments/${commentId}`);
    return data;
};