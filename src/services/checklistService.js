import api from "../api/axios";

const base = (workspaceId, boardId, columnId, cardId) =>
    `/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}/checklists`;

export const getChecklists = async (workspaceId, boardId, columnId, cardId) => {
    const { data } = await api.get(base(workspaceId, boardId, columnId, cardId));
    return data;
};

export const createChecklist = async (workspaceId, boardId, columnId, cardId, title) => {
    const { data } = await api.post(base(workspaceId, boardId, columnId, cardId), { title });
    return data;
};

export const deleteChecklist = async (workspaceId, boardId, columnId, cardId, checklistId) => {
    await api.delete(`${base(workspaceId, boardId, columnId, cardId)}/${checklistId}`);
};

export const addChecklistItem = async (workspaceId, boardId, columnId, cardId, checklistId, content) => {
    const { data } = await api.post(
        `${base(workspaceId, boardId, columnId, cardId)}/${checklistId}/items`,
        { content },
    );
    return data;
};

export const updateChecklistItem = async (workspaceId, boardId, columnId, cardId, checklistId, itemId, payload) => {
    const { data } = await api.put(
        `${base(workspaceId, boardId, columnId, cardId)}/${checklistId}/items/${itemId}`,
        payload,
    );
    return data;
};

export const deleteChecklistItem = async (workspaceId, boardId, columnId, cardId, checklistId, itemId) => {
    await api.delete(
        `${base(workspaceId, boardId, columnId, cardId)}/${checklistId}/items/${itemId}`,
    );
};
