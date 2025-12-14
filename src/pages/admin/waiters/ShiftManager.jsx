import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Loader2, Clock, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { adminWaiterService } from "@/api/adminWaiterService.js";

const ShiftManager = () => {
    const [shifts, setShifts] = useState([]);
    const [waiters, setWaiters] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterWaiterId, setFilterWaiterId] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 6;

    const { register, handleSubmit, reset,
        formState: { isSubmitting, errors } } = useForm();

    const generateTimeOptions = () => {
        const options = [];
        for (let i = 12; i <= 22; i++) {
            const hour = i.toString().padStart(2, '0');

            options.push(`${hour}:00`);

            if (i < 22) {
                options.push(`${hour}:30`);
            }
        }
        return options;
    };

    const timeOptions = generateTimeOptions();

    const loadShifts = async () => {
        setLoading(true);
        try {
            const data = await adminWaiterService.getAllShifts(
                filterWaiterId || null,
                page,
                pageSize
            );

            setShifts(data.content);
            setTotalPages(data.totalPages);
        } catch {
            toast.error("Błąd pobierania grafiku.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        adminWaiterService.getAllWaiters().then(setWaiters).catch(() => {});
    }, []);

    useEffect(() => {
        void loadShifts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filterWaiterId]);


    const onSubmit = async (data) => {
        try {
            const startDateTime = `${data.date}T${data.startTime}:00`;
            const endDateTime = `${data.date}T${data.endTime}:00`;

            if (data.startTime >= data.endTime) {
                toast.error("Godzina zakończenia musi być późniejsza niż rozpoczęcia.");
                return;
            }

            await adminWaiterService.createShift({
                waiterId: Number.parseInt(data.waiterId),
                start: startDateTime,
                end: endDateTime
            });

            toast.success("Zmiana dodana!");
            reset();
            void loadShifts();
        } catch (error) {
            const msg = error.response?.data?.detail || "Błąd dodawania (kolizja?).";
            toast.error(msg);
        }
    };

    const handleDelete = async (id) => {
        if (!globalThis.confirm("Usunąć zmianę?")) return;
        try {
            await adminWaiterService.deleteShift(id);
            toast.success("Usunięto.");
            loadShifts();
        } catch {
            toast.error("Błąd usuwania.");
        }
    };

    const handleFilterChange = (e) => {
        setFilterWaiterId(e.target.value);
        setPage(0);
    };

    const formatDateTime = (isoString) => {
        return new Date(isoString).toLocaleString('pl-PL', {
            weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader><CardTitle>Zaplanuj Zmianę 📅</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        <div className="space-y-2">
                            <Label className={errors.waiterId ? "text-red-500" : ""}>Pracownik</Label>
                            <select
                                {...register("waiterId", { required: "Musisz wybrać pracownika" })}
                                className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm 
                                transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
                                 ${errors.waiterId ? "border-red-500 focus-visible:ring-red-500" : "border-input"}`}
                            >
                                <option value="">-- Wybierz --</option>
                                {waiters.map(w => <option key={w.id} value={w.id}>{w.firstName} {w.lastName}</option>)}
                            </select>
                            {errors.waiterId && <p className="text-red-500 text-xs">{errors.waiterId.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <div className="space-y-2">
                                <Label className={errors.date ? "text-red-500" : ""}>Data</Label>
                                <Input
                                    type="date"
                                    className={`cursor-pointer block ${errors.date ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    onClick={(e) => e.target.showPicker?.()}
                                    {...register("date", { required: "Data jest wymagana" })}
                                />
                                {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className={errors.startTime ? "text-red-500" : ""}>Od godziny</Label>
                                <select
                                    {...register("startTime", { required: "Wymagane" })}
                                    className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm 
                                    cursor-pointer ${errors.startTime ? "border-red-500" : "border-input"}`}
                                >
                                    <option value="">-- Wybierz --</option>
                                    {timeOptions.map(time => (
                                        <option key={`start-${time}`} value={time}>{time}</option>
                                    ))}
                                </select>
                                {errors.startTime && <p className="text-red-500 text-xs">{errors.startTime.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className={errors.endTime ? "text-red-500" : ""}>Do godziny</Label>
                                <select
                                    {...register("endTime", { required: "Wymagane" })}
                                    className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm 
                                    cursor-pointer ${errors.endTime ? "border-red-500" : "border-input"}`}
                                >
                                    <option value="">-- Wybierz --</option>
                                    {timeOptions.map(time => (
                                        <option key={`end-${time}`} value={time}>{time}</option>
                                    ))}
                                </select>
                                {errors.endTime && <p className="text-red-500 text-xs">{errors.endTime.message}</p>}
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            Dodaj do Grafiku
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-bold">Aktualny Grafik</h2>

                    <div className="flex items-center gap-2 bg-white p-2 border rounded-md shadow-sm">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select
                            className="bg-transparent text-sm outline-none cursor-pointer min-w-[200px]"
                            value={filterWaiterId}
                            onChange={handleFilterChange}
                        >
                            <option value="">Wszyscy pracownicy</option>
                            {waiters.map(w => (
                                <option key={w.id} value={w.id}>{w.firstName} {w.lastName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary"/></div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {shifts.length === 0 && <p className="col-span-full text-center text-gray-500 py-8">Brak wyników.</p>}

                            {shifts.map((shift) => (
                                <Card key={shift.id} className="flex flex-row items-center justify-between p-4 border-l-4 border-l-primary
                                hover:bg-slate-50 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-full text-primary">
                                            <Clock className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{shift.waiterName}</h3>
                                            <p className="text-sm text-gray-600">
                                                {formatDateTime(shift.start)} ➝ {new Date(shift.end).
                                            toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600"
                                            onClick={() => handleDelete(shift.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </Card>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Poprzednia
                                </Button>
                                <span className="text-sm font-medium">
                                    Strona {page + 1} z {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page === totalPages - 1}
                                >
                                    Następna <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ShiftManager;