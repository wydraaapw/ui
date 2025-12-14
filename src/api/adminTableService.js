import axiosClient from "@/api/axiosClient";

export const adminTableService = {
    getAllTables: async () => {
        const res = await axiosClient.get("/api/admin/tables");
        return res.data;
    },

    createTable: async (data) => {
        const res = await axiosClient.post("/api/admin/tables", data);
        return res.data;
    },

    deleteTable: async (id) => {
        await axiosClient.delete(`/api/admin/tables/${id}`);
    }
};