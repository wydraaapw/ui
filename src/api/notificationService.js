import axiosClient from "@/api/axiosClient";

export const notificationService = {
    getAll: async () => {
        const res = await axiosClient.get("/api/notifications");
        return res.data;
    },

    getUnreadCount: async () => {
        const res = await axiosClient.get("/api/notifications/unread-count");
        return res.data;
    },

    markAsRead: async (id) => {
        await axiosClient.patch(`/api/notifications/${id}/read`);
    },

    markAllAsRead: async () => {
        await axiosClient.patch("/api/notifications/read-all");
    },
};