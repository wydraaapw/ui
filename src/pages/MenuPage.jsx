import { useState, useEffect } from "react";
import { clientMenuService } from "@/api/clientMenuService.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Utensils, Wheat, Info } from "lucide-react";
import { toast } from "react-toastify";

const MenuPage = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("Wszystkie");
    const [categories, setCategories] = useState(["Wszystkie"]);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const data = await clientMenuService.getMenu();
                setMenuItems(data);

                const uniqueCategories = ["Wszystkie", ...new Set(data.map(item => item.categoryName))];
                setCategories(uniqueCategories);
            } catch {
                toast.error("Nie udało się pobrać menu.");
            } finally {
                setLoading(false);
            }
        };
        void fetchMenu();
    }, []);

    const filteredItems = activeCategory === "Wszystkie"
        ? menuItems
        : menuItems.filter(item => item.categoryName === activeCategory);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-gray-500">Przygotowujemy kartę dań...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-6xl min-h-[80vh]">
            <div className="text-center mb-10 space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-primary flex justify-center items-center gap-3">
                    <Utensils className="h-8 w-8" /> Nasze Menu
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    Odkryj smak prawdziwej pasji. Świeże składniki, unikalne receptury i niezapomniane doznania kulinarne.
                </p>
            </div>

            <div className="sticky top-[70px] z-10 bg-white/95 backdrop-blur-sm py-4 mb-8 border-b shadow-sm -mx-4 px-4 md:mx-0 md:px-0 md:rounded-xl">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center">
                    {categories.map((cat) => (
                        <Button
                            key={cat}
                            variant={activeCategory === cat ? "default" : "outline"}
                            onClick={() => setActiveCategory(cat)}
                            className={`rounded-full px-6 transition-all ${
                                activeCategory === cat ? "shadow-md scale-105" : "border-slate-300 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Info className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    Brak dań w tej kategorii.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {filteredItems.map((dish) => (
                        <Card key={dish.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-slate-200 flex flex-col h-full">
                            <div className="relative h-48 overflow-hidden bg-gray-100">
                                {dish.imageUrl ? (
                                    <img
                                        src={dish.imageUrl}
                                        alt={dish.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-slate-50">
                                        <Utensils className="h-12 w-12 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full font-bold text-primary shadow-sm">
                                    {dish.price} zł
                                </div>
                            </div>

                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start gap-2">
                                    <CardTitle className="text-xl font-bold text-gray-800 line-clamp-2">
                                        {dish.name}
                                    </CardTitle>
                                </div>
                                <div className="text-xs font-semibold text-primary/80 uppercase tracking-wider mt-1">
                                    {dish.categoryName}
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col gap-4">
                                <CardDescription className="text-gray-600 italic line-clamp-3 flex-1">
                                    {dish.description || "Brak opisu dla tego dania."}
                                </CardDescription>

                                {dish.ingredientNames && dish.ingredientNames.length > 0 && (
                                    <div className="border-t pt-3 mt-auto">
                                        <div className="flex flex-wrap gap-1">
                                            {dish.ingredientNames.map((ingredient) => (
                                                <Badge
                                                    key={ingredient}
                                                    variant="secondary"
                                                    className="text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                >
                                                    <Wheat className="h-3 w-3 mr-1 opacity-50" />
                                                    {ingredient}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MenuPage;