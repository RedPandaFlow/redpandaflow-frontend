import api from "../api/axios";

export const getCardActivities = async (workspaceId, boardId, columnId, cardId) => {
    const { data } = await api.get(
        `/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}/activities`,
    );
    return data;
};
