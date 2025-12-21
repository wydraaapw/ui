import axiosClient from "@/api/axiosClient";

export const accountService = {
    getMyProfile: async () => {
        const res = await axiosClient.get("/api/users/me");
        return res.data;
    },

    changePassword: async (data) => {
        await axiosClient.post("/api/auth/change-password", data);
    }
};