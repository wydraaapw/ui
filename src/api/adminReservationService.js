import axiosClient from "@/api/axiosClient";

export const adminReservationService = {
    getAllReservations: async () => {
        const res = await axiosClient.get("/api/reservations");
        return res.data;
    },

    updateStatus: async (id, status) => {
        await axiosClient.patch(`/api/reservations/${id}/status`, null, {
            params: { status }
        });
    },

    getAvailableWaiters: async (reservationId) => {
        const res = await axiosClient.get(`/api/reservations/${reservationId}/available-waiters`);
        return res.data;
    },

    assignWaiter: async (reservationId, waiterId) => {
        await axiosClient.patch(`/api/reservations/${reservationId}/assign-waiter`, null, {
            params: { waiterId }
        });
    }
};