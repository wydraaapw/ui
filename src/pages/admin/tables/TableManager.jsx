import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Trash2,
    Loader2,
    Armchair,
    DoorOpen,
    Martini,
    Accessibility,
    Utensils,
    Plus,
    ChevronLeft
} from "lucide-react";
import { toast } from "react-toastify";
import { adminTableService } from "@/api/adminTableService.js";
import { cn } from "@/lib/utils";

const GRID_ROWS = 6;
const GRID_COLS = 6;

const TableManager = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedType, setSelectedType] = useState("TABLE");

    const { register, handleSubmit, reset, setValue, formState: { isSubmitting, errors } } = useForm();

    const loadTables = async () => {
        try {
            const data = await adminTableService.getAllTables();
            setTables(data);
        } catch {
            toast.error("Błąd pobierania układu sali.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadTables();
    }, []);

    const handleSlotClick = (row, col) => {
        setSelectedSlot({ row, col });
        setSelectedType("TABLE");
        setIsDialogOpen(true);
        reset();
        setValue("seats", 4);
    };

    const onSubmit = async (data) => {
        if (!selectedSlot) return;

        try {
            const payload = {
                rowPosition: selectedSlot.row,
                columnPosition: selectedSlot.col,
                tableType: selectedType
            };

            if (selectedType === "TABLE") {
                payload.tableNumber = Number.parseInt(data.tableNumber);
                payload.seats = Number.parseInt(data.seats);
            } else {
                payload.tableNumber = null;
                payload.seats = null;
            }

            await adminTableService.createTable(payload);

            toast.success("Element dodany!");
            setIsDialogOpen(false);
            await loadTables();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Błąd dodawania elementu.");
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm("Usunąć ten element?")) return;

        try {
            await adminTableService.deleteTable(id);
            toast.success("Usunięto.");
            await loadTables();
        } catch (error){
            toast.error(error.response?.data?.detail);
        }
    };

    const renderItem = (item) => {
        switch (item.tableType) {
            case "TABLE":
                return (
                    <div className="flex flex-col items-center text-primary animate-in zoom-in duration-300">
                        <span className="font-extrabold text-2xl">{item.tableNumber}</span>
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full mt-1">
                            <Armchair className="h-3 w-3" />
                            {item.seats}
                        </div>
                    </div>
                );
            case "WC":
                return (
                    <div className="flex flex-col items-center justify-center text-blue-600">
                        <Accessibility className="h-8 w-8" />
                        <span className="text-[10px] font-bold uppercase mt-1">WC</span>
                    </div>
                );
            case "BAR":
                return (
                    <div className="flex flex-col items-center justify-center text-amber-700">
                        <Martini className="h-8 w-8" />
                        <span className="text-[10px] font-bold uppercase mt-1">Bar</span>
                    </div>
                );
            case "ENTRANCE":
                return (
                    <div className="flex flex-col items-center justify-center text-green-700">
                        <DoorOpen className="h-8 w-8" />
                        <span className="text-[10px] font-bold uppercase mt-1">Wejście</span>
                    </div>
                );
            case "KITCHEN":
                return (
                    <div className="flex flex-col items-center justify-center text-orange-600">
                        <Utensils className="h-8 w-8" />
                        <span className="text-[10px] font-bold uppercase mt-1">Kuchnia</span>
                    </div>
                );
            default:
                return null;
        }
    };

    const getItemStyles = (type) => {
        switch (type) {
            case "TABLE": return "bg-white border-2 border-primary shadow-md z-10";
            case "WC": return "bg-blue-100 border-2 border-blue-300 border-dashed opacity-90";
            case "BAR": return "bg-amber-100 border-2 border-amber-300 border-dashed opacity-90";
            case "ENTRANCE": return "bg-green-100 border-2 border-green-300 border-dashed opacity-90";
            case "KITCHEN": return "bg-orange-50 border-2 border-orange-300 border-dashed opacity-90";
            default: return "bg-gray-100";
        }
    };

    const renderGrid = () => {
        const grid = [];
        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                const item = tables.find(t => t.rowPosition === r && t.columnPosition === c);

                if (item) {
                    grid.push(
                        <div
                            key={`${r}-${c}`}
                            className={cn(
                                "aspect-square rounded-xl flex items-center justify-center relative transition-all",
                                getItemStyles(item.tableType)
                            )}
                        >
                            {renderItem(item)}
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 absolute -top-2 -right-2 bg-white border border-gray-200 shadow-sm rounded-full text-gray-400 hover:text-red-600 hover:border-red-200 z-20"
                                onClick={(e) => handleDelete(e, item.id)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    );
                } else {
                    grid.push(
                        <button
                            key={`${r}-${c}`}
                            type="button"
                            onClick={() => handleSlotClick(r, c)}
                            className="aspect-square rounded-xl flex items-center justify-center relative transition-all border border-slate-200 bg-slate-50/30 hover:bg-slate-100 hover:border-slate-300 cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <Plus className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    );
                }
            }
        }
        return grid;
    };

    if (loading) return <Loader2 className="animate-spin mx-auto mt-10" />;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/admin">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">Układ Sali 🗺️</h1>
            </div>

            <p className="text-gray-500 mb-8">
                Kliknij w puste pole, aby dodać element. Puste pola będą niewidoczne dla klientów, tworząc kształt sali.
            </p>

            <Card className="bg-slate-100 overflow-hidden border border-slate-200">
                <div className="overflow-x-auto p-10">
                    <div
                        className="grid gap-6 mx-auto"
                        style={{
                            gridTemplateColumns: `repeat(${GRID_COLS}, minmax(100px, 1fr))`,
                            width: 'max-content',
                            minWidth: '100%'
                        }}
                    >
                        {renderGrid()}
                    </div>
                </div>
            </Card>

            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
                        <CardHeader>
                            <CardTitle>Dodaj element (R{selectedSlot?.row + 1}:K{selectedSlot?.col + 1})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'TABLE', label: 'Stolik', icon: <Armchair className="h-4 w-4"/> },
                                        { id: 'BAR', label: 'Bar', icon: <Martini className="h-4 w-4"/> },
                                        { id: 'WC', label: 'WC', icon: <Accessibility className="h-4 w-4"/> },
                                        { id: 'ENTRANCE', label: 'Wejście', icon: <DoorOpen className="h-4 w-4"/> },
                                        { id: 'KITCHEN', label: 'Kuchnia', icon: <Utensils className="h-4 w-4"/> },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setSelectedType(type.id)}
                                            className={cn(
                                                "cursor-pointer border rounded-md p-3 flex flex-col items-center gap-2 transition-all hover:bg-slate-50 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                                selectedType === type.id ? "border-primary bg-primary/5 text-primary ring-1 ring-primary" : "border-slate-200 text-slate-500"
                                            )}
                                        >
                                            {type.icon}
                                            <span className="text-xs font-medium">{type.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {selectedType === "TABLE" && (
                                    <div className="space-y-4 animate-in slide-in-from-top-2">
                                        <div className="space-y-2">
                                            <Label>Numer stolika</Label>
                                            <Input
                                                type="number"
                                                {...register("tableNumber", { required: "Wymagane", min: 1 })}
                                                autoFocus
                                                placeholder="np. 10"
                                            />
                                            {errors.tableNumber && <span className="text-red-500 text-xs">Wymagane</span>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Liczba miejsc</Label>
                                            <Input
                                                type="number"
                                                defaultValue="4"
                                                {...register("seats", { required: "Wymagane", min: 1, max: 20 })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 justify-end pt-2">
                                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Anuluj</Button>
                                    <Button type="submit" disabled={isSubmitting}>Zapisz</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default TableManager;