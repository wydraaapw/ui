import axiosClient from "@/api/axiosClient";

export const reservationService = {
    getOccupiedTables: async (start, end) => {
        const res = await axiosClient.get("/api/reservations/occupied", {
            params: { start, end }
        });
        return res.data;
    },

    createReservation: async (data) => {

        await axiosClient.post("/api/reservations", data);
    },

    getMyReservations: async () => {
        const res = await axiosClient.get("/api/reservations/my");
        return res.data;
    },

    cancelReservation: async (id) => {
        await axiosClient.patch(`/api/reservations/${id}/cancel`);
    },

    getWaiterReservations: async () => {
        const response = await axiosClient.get("/api/reservations/waiter-my");
        return response.data;
    },

    updateDishStatus: async (reservationId, dishId) => {
        await axiosClient.patch(`/api/reservations/${reservationId}/dish/${dishId}/status`);
    }


};