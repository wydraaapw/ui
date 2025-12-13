import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const ResourceManager = ({
                             title,
                             fetchFn,
                             createFn,
                             deleteFn,
                             placeholder = "Wpisz nazwę..."
                         }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

    const loadItems = async () => {
        try {
            const data = await fetchFn();
            setItems(data);
        } catch {
            toast.error("Nie udało się pobrać danych.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async (data) => {
        try {
            await createFn(data);
            toast.success("Dodano pomyślnie!");
            reset();
            void loadItems();
        } catch (error) {
            const msg = error.response?.data?.detail || "Błąd podczas dodawania.";
            toast.error(msg);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Czy na pewno chcesz usunąć ten element?")) return;

        try {
            await deleteFn(id);
            toast.success("Usunięto pomyślnie.");
            void loadItems();
        } catch (error) {
            const msg = error.response?.data?.detail || "Nie można usunąć elementu.";
            toast.error(msg);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4 mb-8 items-start">
                    <div className="flex-1">
                        <Input
                            placeholder={placeholder}
                            {...register("name", { required: "To pole jest wymagane" })}
                        />
                        {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
                        Dodaj
                    </Button>
                </form>

                {loading ? (
                    <div className="text-center py-4"><Loader2 className="animate-spin h-6 w-6 mx-auto text-primary"/></div>
                ) : (
                    <div className="space-y-2">
                        {items.length === 0 && <p className="text-center text-gray-500">Brak elementów. Dodaj pierwszy!</p>}

                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 border rounded-md group hover:bg-slate-100 transition">
                                <span className="font-medium">{item.name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


ResourceManager.propTypes = {
    title: PropTypes.string.isRequired,
    fetchFn: PropTypes.func.isRequired,
    createFn: PropTypes.func.isRequired,
    deleteFn: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
};

export default ResourceManager;