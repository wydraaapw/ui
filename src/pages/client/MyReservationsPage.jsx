import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { reservationService } from "@/api/reservationService.js";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Loader2, CalendarDays, Clock, MapPin, CheckCircle2,
    Utensils, ChefHat, Filter, ChevronDown, XCircle
} from "lucide-react";
import { toast } from "react-toastify";

const MyReservationsPage = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [expandedIds, setExpandedIds] = useState([]);

    const fetchReservations = useCallback(async () => {
        try {
            const data = await reservationService.getMyReservations();
            setReservations(data);
        } catch {
            toast.error("Nie udało się pobrać Twoich rezerwacji.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchReservations();
    }, [fetchReservations]);


    const handleCancelReservation = async (id) => {
        if (!confirm("Czy na pewno chcesz anulować tę rezerwację? Operacji nie można cofnąć.")) return;

        try {
            await reservationService.cancelReservation(id);
            toast.success("Rezerwacja została anulowana.");
            void fetchReservations();
        } catch (error) {
            const msg = error.response?.data?.detail || "Nie udało się anulować rezerwacji.";
            toast.error(msg);
        }
    };

    const filteredReservations = statusFilter === "ALL"
        ? reservations
        : reservations.filter(r => r.status === statusFilter);

    const toggleExpand = (id) => {
        setExpandedIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "PENDING": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Oczekiwanie</Badge>;
            case "CONFIRMED": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Potwierdzona</Badge>;
            case "COMPLETED": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Zakończona</Badge>;
            case "CANCELLED": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Anulowana</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString('pl-PL', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString('pl-PL', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

    return (
        <div className="container mx-auto p-4 max-w-3xl min-h-[80vh]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <CalendarDays className="h-8 w-8 text-primary" /> Moje Rezerwacje
                </h1>

                <div className="flex items-center gap-2 bg-white p-2 rounded-md border shadow-sm self-end sm:self-auto">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                        className="text-sm bg-transparent outline-none cursor-pointer font-medium text-gray-700 min-w-[130px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Wszystkie</option>
                        <option value="PENDING">Oczekujące</option>
                        <option value="CONFIRMED">Potwierdzone</option>
                        <option value="COMPLETED">Zakończone</option>
                        <option value="CANCELLED">Anulowane</option>
                    </select>
                </div>
            </div>

            {filteredReservations.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-gray-500 mb-4">
                        {statusFilter === "ALL"
                            ? "Nie masz jeszcze żadnych rezerwacji."
                            : "Brak rezerwacji o wybranym statusie."}
                    </p>
                    {statusFilter === "ALL" && (
                        <Button asChild>
                            <Link to="/reservations">Zarezerwuj stolik</Link>
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {filteredReservations.map((res) => {
                        const isExpanded = expandedIds.includes(res.id);

                        const canCancel = res.status === 'PENDING' || res.status === 'CONFIRMED';

                        return (
                            <Card
                                key={res.id}
                                className={`overflow-hidden transition-all duration-200 border-l-4 ${isExpanded ? 'shadow-md border-l-primary' : 'hover:shadow-sm border-l-slate-300'}`}
                            >
                                <CardHeader
                                    className="bg-white cursor-pointer hover:bg-slate-50 transition-colors p-4 sm:p-6"
                                    onClick={() => toggleExpand(res.id)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                            <div className="flex items-center gap-3">
                                                <div className="font-bold text-lg text-gray-800">
                                                    {formatDate(res.start)}
                                                </div>
                                                {getStatusBadge(res.status)}
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4"/> {formatTime(res.start)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4"/> Stolik {res.tableNumber}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-300 hidden sm:block font-mono">#{res.id}</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                {isExpanded && (
                                    <CardContent className="pt-0 pb-6 px-4 sm:px-6 bg-slate-50/30 border-t">
                                        <div className="mt-4 animate-in slide-in-from-top-2 duration-300">

                                            {res.dishes && res.dishes.length > 0 ? (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-700">
                                                        <Utensils className="h-4 w-4"/> Szczegóły zamówienia:
                                                    </h4>
                                                    <ul className="grid gap-2 sm:grid-cols-2">
                                                        {res.dishes.map((dish) => (
                                                            <li key={dish.id} className="flex items-center justify-between p-2 bg-white rounded border border-slate-100 text-sm shadow-sm">
                                                                <div className="flex items-center gap-2 truncate">
                                                                    <Badge variant="secondary" className="font-mono h-6 w-6 flex items-center justify-center p-0 shrink-0">
                                                                        {dish.quantity}x
                                                                    </Badge>
                                                                    <span className="font-medium text-gray-700 truncate" title={dish.name}>{dish.name}</span>
                                                                </div>

                                                                <div className="pl-2 shrink-0">
                                                                    {dish.isServed ? (
                                                                        <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-[10px] font-bold uppercase border border-green-100">
                                                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Wydano
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center text-orange-600 bg-orange-50 px-2 py-1 rounded text-[10px] font-bold uppercase border border-orange-100">
                                                                            <ChefHat className="h-3 w-3 mr-1" /> W kuchni
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-400 italic mb-4 p-4 bg-white rounded border border-dashed text-center">
                                                    Brak zamówionych dań w systemie (tylko rezerwacja miejsca).
                                                </div>
                                            )}

                                            <div className="pt-4 border-t flex flex-col md:flex-row justify-between items-start md:items-center text-sm mt-4 gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-gray-500">
                                                        Zakończenie wizyty: <span className="font-medium text-gray-900">{formatTime(res.end)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-500">Obsługa:</span>
                                                        {res.waiterName === "Nie przypisano" ? (
                                                            <span className="text-gray-400 italic">Oczekiwanie na przydział</span>
                                                        ) : (
                                                            <Badge variant="outline" className="font-medium text-primary border-primary/20 bg-primary/5">
                                                                🤵 {res.waiterName}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {canCancel && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="w-full md:w-auto"
                                                        onClick={() => handleCancelReservation(res.id)}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Anuluj rezerwację
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyReservationsPage;