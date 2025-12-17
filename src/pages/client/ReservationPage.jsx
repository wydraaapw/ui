import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    CalendarIcon,
    Clock,
    Armchair,
    CheckCircle2,
    Users,
    ChevronRight,
    ChevronLeft,
    DoorOpen,
    Martini,
    Accessibility,
    Utensils,
    Minus,
    Plus,
    UtensilsCrossed
} from "lucide-react";
import { toast } from "react-toastify";
import { adminTableService } from "@/api/adminTableService.js";
import { reservationService } from "@/api/reservationService.js";
import { clientMenuService } from "@/api/clientMenuService.js";
import { cn } from "@/lib/utils";

const GRID_ROWS = 6;
const GRID_COLS = 6;

const ReservationPage = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [reservationData, setReservationData] = useState({
        date: "",
        time: "",
        duration: "2",
        tableId: null,
        tableNumber: null,
        seats: null,
        dishes: {}
    });

    const [tables, setTables] = useState([]);
    const [occupiedTableIds, setOccupiedTableIds] = useState([]);
    const [loadingGrid, setLoadingGrid] = useState(false);

    const [menuItems, setMenuItems] = useState([]);
    const [loadingMenu, setLoadingMenu] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            date: "",
            time: "",
            duration: "2"
        }
    });
    const selectedDate = watch("date");

    useEffect(() => {
        const fetchMenu = async () => {
            setLoadingMenu(true);
            try {
                const data = await clientMenuService.getMenu();
                setMenuItems(data);
            } catch {
                toast.error("Nie udało się pobrać menu.");
            } finally {
                setLoadingMenu(false);
            }
        };
        void fetchMenu();
    }, []);


    const getAvailableHours = () => {
        const hours = [];
        const now = new Date();
        const currentHour = now.getHours();
        const todayStr = now.toISOString().split('T')[0];

        const isToday = selectedDate === todayStr;

        for (let h = 12; h <= 22; h++) {
            if (isToday && h <= currentHour) {
                continue;
            }

            hours.push({ value: `${h}:00`, label: `${h}:00` });
            if (h !== 22) {
                if (!isToday || h > currentHour) {
                    hours.push({ value: `${h}:30`, label: `${h}:30` });
                }
            }
        }
        return hours;
    };

    const onStep1Submit = async (data) => {
        const selectedDateTime = new Date(`${data.date}T${data.time}:00`);
        const now = new Date();

        if (selectedDateTime < now) {
            toast.error("Nie możesz wybrać daty z przeszłości!");
            return;
        }

        setReservationData(prev => ({ ...prev, ...data }));
        setStep(2);
        void fetchTablesAndAvailability(data.date, data.time, data.duration);
    };

    const fetchTablesAndAvailability = async (date, time, duration) => {
        setLoadingGrid(true);
        try {
            const startIso = `${date}T${time}:00`;
            const endDate = new Date(new Date(startIso).getTime() + Number.parseInt(duration) * 60 * 60 * 1000);
            const endIso = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 19);

            const [allTables, occupied] = await Promise.all([
                adminTableService.getAllTables(),
                reservationService.getOccupiedTables(startIso, endIso)
            ]);

            setTables(allTables);
            setOccupiedTableIds(occupied);
        } catch {
            toast.error("Błąd sprawdzania dostępności.");
        } finally {
            setLoadingGrid(false);
        }
    };

    const handleTableSelect = (table) => {
        setReservationData(prev => ({
            ...prev,
            tableId: table.id,
            tableNumber: table.tableNumber,
            seats: table.seats
        }));
    };

    const updateDishQuantity = (dishId, delta) => {
        setReservationData(prev => {
            const currentQty = prev.dishes[dishId] || 0;
            const newQty = Math.max(0, currentQty + delta);

            const newDishes = { ...prev.dishes };
            if (newQty === 0) {
                delete newDishes[dishId];
            } else {
                newDishes[dishId] = newQty;
            }

            return { ...prev, dishes: newDishes };
        });
    };

    const finalizeReservation = async () => {
        try {
            const startIso = `${reservationData.date}T${reservationData.time}:00`;
            const endDate = new Date(new Date(startIso).getTime() + Number.parseInt(reservationData.duration) * 60 * 60 * 1000);
            const endIso = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 19);

            const dishesList = Object.entries(reservationData.dishes).map(([id, qty]) => ({
                dishId: Number.parseInt(id),
                quantity: qty
            }));

            const payload = {
                tableId: reservationData.tableId,
                start: startIso,
                end: endIso,
                dishes: dishesList
            };

            await reservationService.createReservation(payload);
            toast.success("Rezerwacja przyjęta! Sprawdź status w 'Moje Rezerwacje'.");
            navigate("/my-reservations");
        } catch (error) {
            toast.error(error.response?.data?.detail || "Nie udało się utworzyć rezerwacji.");
        }
    };

    const tableTypeNames= {
        WC: "Łazienka",
        BAR: "Bar",
        ENTRANCE: "Wejście",
        KITCHEN: "Kuchnia"
    };

    const renderGridItem = (r, c) => {
        const item = tables.find(t => t.rowPosition === r && t.columnPosition === c);

        if (!item) return <div key={`${r}-${c}`} className="invisible aspect-square" />;

        if (item.tableType !== "TABLE") {
            return (
                <div key={`${r}-${c}`} className={cn("aspect-square rounded-xl flex flex-col items-center justify-center opacity-70 border border-dashed",
                    item.tableType === 'WC' && "bg-blue-50 border-blue-200 text-blue-500",
                    item.tableType === 'BAR' && "bg-amber-50 border-amber-200 text-amber-600",
                    item.tableType === 'ENTRANCE' && "bg-green-50 border-green-200 text-green-600",
                    item.tableType === 'KITCHEN' && "bg-orange-50 border-orange-200 text-orange-600",
                )}>
                    {item.tableType === 'WC' && <Accessibility className="h-6 w-6"/>}
                    {item.tableType === 'BAR' && <Martini className="h-6 w-6"/>}
                    {item.tableType === 'ENTRANCE' && <DoorOpen className="h-6 w-6"/>}
                    {item.tableType === 'KITCHEN' && <Utensils className="h-6 w-6"/>}
                    <span className="text-[10px] font-bold mt-1">{tableTypeNames[item.tableType] || item.tableType}</span>
                </div>
            );
        }

        const isOccupied = occupiedTableIds.includes(item.id);
        const isSelected = reservationData.tableId === item.id;

        let baseStyles = "aspect-square rounded-xl flex flex-col items-center justify-center transition-all border-2 relative shadow-sm";
        let stateStyles = "bg-white border-slate-200 hover:border-primary/50 hover:bg-slate-50 cursor-pointer text-slate-700";

        if (isOccupied){
            stateStyles = "bg-red-50 border-red-200 cursor-not-allowed opacity-60 grayscale";
        } else if (isSelected){
            stateStyles = "bg-primary text-primary-foreground border-primary scale-105 shadow-md ring-2 ring-offset-2 ring-primary";
        }

        return (
            <button
                key={`${r}-${c}`}
                type="button"
                disabled={isOccupied}
                onClick={() => handleTableSelect(item)}
                className={cn(baseStyles, stateStyles)}
            >
                <span className="font-extrabold text-xl">{item.tableNumber}</span>
                <div className="flex items-center gap-1 text-xs font-medium mt-1">
                    <Users className="h-3 w-3" />
                    {item.seats}
                </div>
                {isOccupied && <span className="absolute inset-0 flex items-center justify-center bg-white/50 text-red-700 font-bold text-xs rotate-[-12deg]">ZAJĘTE</span>}
            </button>
        );
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl min-h-[80vh] flex flex-col items-center">

            <div className="w-full mb-8">
                <h1 className="text-3xl font-bold text-center mb-2">Rezerwacja Stolika 📅</h1>
                <div className="flex justify-center gap-2 text-sm text-gray-500">
                    <span className={cn(step >= 1 && "text-primary font-bold")}>1. Termin</span>
                    <span>→</span>
                    <span className={cn(step >= 2 && "text-primary font-bold")}>2. Stolik</span>
                    <span>→</span>
                    <span className={cn(step >= 3 && "text-primary font-bold")}>3. Menu (Opcjonalne)</span>
                    <span>→</span>
                    <span className={cn(step >= 4 && "text-primary font-bold")}>4. Potwierdzenie</span>
                </div>
            </div>

            {step === 1 && (
                <Card className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader>
                        <CardTitle>Wybierz termin</CardTitle>
                        <CardDescription>Kiedy chcesz nas odwiedzić?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Data</Label>
                                <Input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    {...register("date", { required: "Data wymagana" })}
                                />
                                {errors.date && <span className="text-red-500 text-xs">Wymagane</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Godzina</Label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        {...register("time", { required: "Godzina wymagana" })}
                                    >
                                        <option value="">--:--</option>
                                        {getAvailableHours().map(slot => (
                                            <option key={slot.value} value={slot.value}>{slot.label}</option>
                                        ))}
                                    </select>
                                    {errors.time && <span className="text-red-500 text-xs">Wymagane</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Czas trwania</Label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                        {...register("duration")}
                                    >
                                        <option value="1">1 godzina</option>
                                        <option value="2">2 godziny</option>
                                        <option value="3">3 godziny</option>
                                    </select>
                                </div>
                            </div>

                            <Button type="submit" className="w-full mt-4">
                                Dalej <ChevronRight className="ml-2 h-4 w-4"/>
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {step === 2 && (
                <div className="w-full animate-in fade-in slide-in-from-right-8">
                    <div className="flex justify-between items-center mb-4">
                        <Button variant="ghost" onClick={() => setStep(1)}><ChevronLeft className="mr-2 h-4 w-4"/> Zmień datę</Button>
                        <div className="text-right">
                            <div className="font-bold text-lg">{reservationData.date} | {reservationData.time}</div>
                            <div className="text-xs text-gray-500">Czas trwania: {reservationData.duration}h</div>
                        </div>
                    </div>

                    <Card className="bg-slate-50 border-slate-200 overflow-hidden mb-6">
                        <div className="p-8 overflow-x-auto">
                            {loadingGrid ? (
                                <div className="text-center py-20 text-gray-500">Sprawdzanie dostępności...</div>
                            ) : (
                                <div
                                    className="grid gap-4 mx-auto"
                                    style={{
                                        gridTemplateColumns: `repeat(${GRID_COLS}, minmax(80px, 1fr))`,
                                        width: 'max-content',
                                        minWidth: '100%'
                                    }}
                                >
                                    {Array.from({ length: GRID_ROWS }).map((_, r) => (
                                        Array.from({ length: GRID_COLS }).map((_, c) => renderGridItem(r, c))
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="bg-white p-3 border-t text-xs flex justify-center gap-6 text-gray-500">
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-slate-300 rounded"></div> Wolny</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-primary rounded"></div> Wybrany</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div> Zajęty</div>
                        </div>
                    </Card>

                    <div className="flex justify-end">
                        <Button
                            disabled={!reservationData.tableId}
                            onClick={() => setStep(3)}
                            className="px-8"
                        >
                            Wybierz stolik nr {reservationData.tableNumber} <ChevronRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="w-full animate-in fade-in slide-in-from-right-8 max-w-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <Button variant="ghost" onClick={() => setStep(2)}><ChevronLeft className="mr-2 h-4 w-4"/> Zmień stolik</Button>
                        <h2 className="font-bold text-xl">Wybierz dania (Opcjonalnie)</h2>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {loadingMenu ? (
                            <div className="text-center py-10">Ładowanie menu...</div>
                        ) : (
                            menuItems.map(dish => (
                                <Card key={dish.id} className="flex flex-row items-center p-4 gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                        <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold">{dish.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{dish.description}</p>
                                        <div className="text-primary font-bold mt-1">{dish.price} zł</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => updateDishQuantity(dish.id, -1)}
                                            disabled={!reservationData.dishes[dish.id]}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-4 text-center font-bold">{reservationData.dishes[dish.id] || 0}</span>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => updateDishQuantity(dish.id, 1)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    <div className="flex justify-between mt-6 pt-4 border-t">
                        <div className="text-sm text-gray-500 flex items-center">
                            {Object.keys(reservationData.dishes).length === 0 ? "Brak wybranych dań" : `Wybrano dań: ${Object.values(reservationData.dishes).reduce((a, b) => a + b, 0)}`}
                        </div>
                        <Button onClick={() => setStep(4)} className="px-8">
                            Podsumowanie <ChevronRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            )}

            {step === 4 && (
                <Card className="w-full max-w-md animate-in zoom-in-95 duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CheckCircle2 className="text-green-600"/> Potwierdzenie</CardTitle>
                        <CardDescription>Sprawdź szczegóły rezerwacji</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-lg space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="text-primary h-5 w-5"/>
                                <div>
                                    <span className="block text-gray-500 text-xs">Data</span>
                                    <span className="font-semibold">{reservationData.date}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="text-primary h-5 w-5"/>
                                <div>
                                    <span className="block text-gray-500 text-xs">Godzina</span>
                                    <span className="font-semibold">{reservationData.time} ({reservationData.duration}h)</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Armchair className="text-primary h-5 w-5"/>
                                <div>
                                    <span className="block text-gray-500 text-xs">Stolik</span>
                                    <span className="font-semibold">Numer {reservationData.tableNumber} ({reservationData.seats} os.)</span>
                                </div>
                            </div>

                            {Object.keys(reservationData.dishes).length > 0 && (
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex items-center gap-3 mb-2">
                                        <UtensilsCrossed className="text-primary h-5 w-5"/>
                                        <span className="font-semibold">Wybrane dania:</span>
                                    </div>
                                    <ul className="pl-8 space-y-1 text-gray-600">
                                        {Object.entries(reservationData.dishes).map(([id, qty]) => {
                                            const dish = menuItems.find(d => d.id === Number(id));
                                            return (
                                                <li key={id} className="flex justify-between">
                                                    <span>{dish?.name || "Danie"}</span>
                                                    <span className="font-mono">x{qty}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>Wróć</Button>
                            <Button className="flex-1" onClick={finalizeReservation}>Rezerwuję</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
};

export default ReservationPage;