import axiosClient from "@/api/axiosClient";

export const adminMenuService = {
    getCategories: async () => {
        const res = await axiosClient.get("/api/admin/categories");
        return res.data;
    },
    createCategory: async (data) => {
        const res = await axiosClient.post("/api/admin/categories", data);
        return res.data;
    },
    deleteCategory: async (id) => {
        await axiosClient.delete(`/api/admin/categories/${id}`);
    },

    getIngredients: async () => {
        const res = await axiosClient.get("/api/admin/ingredients");
        return res.data;
    },
    createIngredient: async (data) => {
        const res = await axiosClient.post("/api/admin/ingredients", data);
        return res.data;
    },
    deleteIngredient: async (id) => {
        await axiosClient.delete(`/api/admin/ingredients/${id}`);
    },

    getDishes: async () => {
        const res = await axiosClient.get("/api/admin/dishes");
        return res.data;
    },
    createDish: async (data) => {
        const res = await axiosClient.post("/api/admin/dishes", data);
        return res.data;
    },
    deleteDish: async (id) => {
        await axiosClient.delete(`/api/admin/dishes/${id}`);
    }
};