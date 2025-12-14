import axiosClient from "@/api/axiosClient";

export const adminWaiterService = {
    getAllWaiters: async () => {
        const res = await axiosClient.get("/api/admin/waiters");
        return res.data;
    },

    createWaiter: async (data) => {
        const res = await axiosClient.post("/api/admin/waiters", data);
        return res.data;
    },

    deleteWaiter: async (id) => {
        await axiosClient.delete(`/api/admin/waiters/${id}`);
    },
    getAllShifts: async (waiterId = null, page = 0, size = 10) => {
        const params = { page, size };
        if (waiterId) params.waiterId = waiterId;

        const res = await axiosClient.get("/api/admin/shifts", { params });
        return res.data;
    },

    createShift: async (data) => {
        const res = await axiosClient.post("/api/admin/shifts", data);
        return res.data;
    },

    deleteShift: async (id) => {
        await axiosClient.delete(`/api/admin/shifts/${id}`);
    }
};