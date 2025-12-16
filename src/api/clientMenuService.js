import axiosClient from "@/api/axiosClient";

export const clientMenuService = {
    getMenu: async () => {
        const res = await axiosClient.get("/api/menu");
        return res.data;
    }
};