import axiosClient from "@/api/axiosClient";

export const opinionService = {
    getAllOpinions: async (page = 0, size = 10) => {
        const res = await axiosClient.get("/api/opinions", {
            params: { page, size }
        });
        return res.data;
    },

    createOpinion: async (data) => {
        await axiosClient.post("/api/opinions", data);
    },

    deleteOpinion: async (id) => {
        await axiosClient.delete(`/api/opinions/${id}`);
    }
};