import api from "../api/axios";

export const getNotifications = async (limit = 20) => {
    const { data } = await api.get("/notifications", { params: { limit } });
    return data;
};

export const markNotificationRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async () => {
    await api.patch("/notifications/read-all");
};

export const deleteAllNotifications = async () => {
    await api.delete("/notifications");
};
