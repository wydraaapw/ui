import { useState } from "react";
import { adminMenuService } from "@/api/adminMenuService.js";
import ResourceManager from "./ResourceManager";
import DishManager from "./DishManager";
import { Button } from "@/components/ui/button";

const AdminMenuPage = () => {
    const [activeTab, setActiveTab] = useState("categories");

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Zarządzanie Menu 🍔</h1>

            <div className="flex gap-2 mb-8 border-b pb-4 overflow-x-auto">
                <Button
                    variant={activeTab === "categories" ? "default" : "ghost"}
                    onClick={() => setActiveTab("categories")}
                >
                    Kategorie
                </Button>
                <Button
                    variant={activeTab === "ingredients" ? "default" : "ghost"}
                    onClick={() => setActiveTab("ingredients")}
                >
                    Składniki
                </Button>
                <Button
                    variant={activeTab === "dishes" ? "default" : "ghost"}
                    onClick={() => setActiveTab("dishes")}
                >
                    Dania
                </Button>
            </div>

            <div className="animate-in fade-in duration-300">
                {activeTab === "categories" && (
                    <ResourceManager
                        title="Kategorie Dań"
                        placeholder="Np. Zupy, Burgery, Napoje"
                        fetchFn={adminMenuService.getCategories}
                        createFn={adminMenuService.createCategory}
                        deleteFn={adminMenuService.deleteCategory}
                    />
                )}

                {activeTab === "ingredients" && (
                    <ResourceManager
                        title="Baza Składników"
                        placeholder="Np. Wołowina, Pomidor, Gluten"
                        fetchFn={adminMenuService.getIngredients}
                        createFn={adminMenuService.createIngredient}
                        deleteFn={adminMenuService.deleteIngredient}
                    />
                )}

                {activeTab === "dishes" && (
                    <DishManager />
                )}
            </div>
        </div>
    );
};

export default AdminMenuPage;