import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import { adminMenuService } from "@/api/adminMenuService.js";

const DishManager = () => {
    const [dishes, setDishes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

    const loadData = async () => {
        try {
            const [dishesData, catData, ingData] = await Promise.all([
                adminMenuService.getDishes(),
                adminMenuService.getCategories(),
                adminMenuService.getIngredients()
            ]);
            setDishes(dishesData);
            setCategories(catData);
            setIngredients(ingData);
        } catch {
            toast.error("Błąd pobierania danych.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
       void loadData();
    }, []);

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                price: Number.parseFloat(data.price),
                categoryId: Number.parseInt(data.categoryId),
                ingredientIds: data.ingredientIds ? data.ingredientIds.map(id => Number.parseInt(id)) : []
            };

            await adminMenuService.createDish(payload);
            toast.success("Danie dodane pomyślnie!");
            reset();
            void loadData();
        } catch (error) {
            const msg = error.response?.data?.detail || "Błąd podczas dodawania dania.";
            toast.error(msg);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Czy na pewno chcesz usunąć to danie?")) return;

        try {
            await adminMenuService.deleteDish(id);
            toast.success("Usunięto pomyślnie.");
            void loadData();
        } catch{
            toast.error("Nie można usunąć dania (może być częścią zamówienia).");
        }
    };

    if (loading) return <div className="text-center py-10"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary"/></div>;

    return (
        <div className="space-y-12">
            <Card className="border-l-4 border-l-primary shadow-sm">
                <CardHeader>
                    <CardTitle>Dodaj Nowe Danie 🍽️</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nazwa dania</Label>
                                <Input {...register("name", { required: "Wymagane" })} placeholder="np. Pizza Pepperoni" />
                                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Cena (PLN)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register("price", { required: "Wymagane", min: 0 })}
                                    placeholder="np. 34.90"
                                />
                                {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Kategoria</Label>
                                <select
                                    {...register("categoryId", { required: "Wybierz kategorię" })}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="">-- Wybierz --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.categoryId && <p className="text-red-500 text-xs">{errors.categoryId.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Link do zdjęcia (URL)</Label>
                                <Input {...register("imageUrl", { required: "Wymagane" })} placeholder="https://..." />
                                {errors.imageUrl && <p className="text-red-500 text-xs">{errors.imageUrl.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Opis</Label>
                            <Input {...register("description")} placeholder="Krótki opis dania..." />
                        </div>

                        <div className="space-y-2">
                            <Label>Składniki</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border p-4 rounded-md bg-slate-50 max-h-40 overflow-y-auto">
                                {ingredients.length === 0 && <span className="text-gray-500 text-sm">Brak składników w bazie. Dodaj je najpierw w zakładce Składniki.</span>}
                                {ingredients.map(ing => (
                                    <label key={ing.id} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            value={ing.id}
                                            {...register("ingredientIds")}
                                            className="accent-primary h-4 w-4 rounded"
                                        />
                                        <span className="text-sm text-gray-700">{ing.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Zapisywanie..." : <><Plus className="mr-2 h-4 w-4"/> Dodaj Danie</>}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-8">
                <h2 className="text-2xl font-bold border-b pb-2">Aktualne Menu</h2>

                {dishes.length === 0 && <p className="text-gray-500 text-center">Menu jest puste.</p>}

                {categories.map((category) => {
                    const categoryDishes = dishes.filter(d => d.categoryName === category.name);
                    if (categoryDishes.length === 0) return null;

                    return (
                        <div key={category.id} className="space-y-4">
                            <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded text-sm font-bold uppercase tracking-wider">
                                    {category.name}
                                </span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categoryDishes.map(dish => (
                                    <Card key={dish.id} className="flex flex-row overflow-hidden min-h-[8rem] hover:shadow-md transition-shadow group relative">
                                        <div className="w-32 bg-gray-200 relative shrink-0">
                                            {dish.imageUrl ? (
                                                <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon/></div>
                                            )}
                                        </div>

                                        <div className="flex-1 p-3 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-lg leading-tight mr-2">{dish.name}</h3>
                                                    <span className="text-primary font-bold whitespace-nowrap">{dish.price} zł</span>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-3">{dish.description}</p>

                                                {dish.ingredients && dish.ingredients.length > 0 && (
                                                    <p className="text-[10px] text-gray-400 mt-1 truncate">
                                                        {dish.ingredients.join(', ')}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex justify-end mt-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                                                    onClick={(e) => handleDelete(dish.id, e)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" /> Usuń
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DishManager;