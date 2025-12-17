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
    }
};