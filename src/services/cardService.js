import api from '../api/axios';

export const getCardsByBoardId = async (workspaceId, boardId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/boards/${boardId}/cards`);
    return data;
};

export const getCardsByColumnId = async (workspaceId, boardId, columnId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards`);
    return data;
};

export const getCardById = async (workspaceId, boardId, columnId, cardId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}`);
    return data;
};

export const createCard = async (workspaceId, boardId, columnId, payload) => {
    const { data } = await api.post(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards`, payload);
    return data;
}

export const updateCard = async (workspaceId, boardId, columnId, cardId, payload) => {
    const { data } = await api.put(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}`, payload);
    return data;
};

export const deleteCard = async (workspaceId, boardId, columnId, cardId) => {
    const { data } = await api.delete(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}`);
    return data;
};

export const updateCardOrder = async (workspaceId, boardId, columnId, cardId, payload) => {
    const { data } = await api.patch(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}/order`, payload);
    return data;
};

export const archiveCard = async (workspaceId, boardId, columnId) => {
    const { data } = await api.post(
        `/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}/archive`
    );
    return data;
};

export const restoreCard = async (workspaceId, boardId, columnId) => {
    const { data } = await api.post(
        `/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}/restore`
    );
    return data;
};

export const getArchivedCardsByBoard = async (workspaceId, boardId) => {
    const { data } = await api.get(
        `/workspaces/${workspaceId}/boards/${boardId}/cards/archived`
    );
    return data;
};

export const getArchivedCardsByColumn = async (workspaceId, boardId) => {
    const { data } = await api.get(
        `/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/archived`
    );
    return data;
};