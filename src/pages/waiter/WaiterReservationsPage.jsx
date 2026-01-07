import { useState, useEffect, useCallback } from "react";
import PropTypes from 'prop-types';
import { reservationService } from "@/api/reservationService.js";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Loader2, CheckCircle2,
    Utensils, ChefHat, Filter, ChevronDown, User, AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";

// --- Funkcja pomocnicza: Aktualizacja stanu lokalnego ---
const toggleDishInList = (reservationsList, reservationId, dishId) => {
    return reservationsList.map(res => {
        if (res.id !== reservationId) return res;

        const updatedDishes = res.dishes.map(dish =>
            dish.id === dishId
                ? { ...dish, isServed: !dish.isServed }
                : dish
        );

        return { ...res, dishes: updatedDishes };
    });
};

// --- KOMPONENT 1: Pojedyncze Danie ---
const ReservationDishItem = ({ dish, canEdit, onToggle, isProcessing }) => {
    const renderStatusBadge = () => {
        if (isProcessing) {
            return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
        }

        if (dish.isServed) {
            return (
                <div className="flex items-center text-green-600 font-bold text-[10px] uppercase bg-green-100 px-2 py-1 rounded-md">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Wydano
                </div>
            );
        }

        return (
            <div className="flex items-center text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-[10px] font-bold uppercase border border-orange-100">
                <ChefHat className="h-3 w-3 mr-1" /> Kuchnia
            </div>
        );
    };

    return (
        <li className="block">
            <button
                type="button"
                disabled={!canEdit || isProcessing}
                onClick={() => onToggle(dish.id)}
                className={`
                    w-full flex items-center justify-between p-3 rounded-lg border text-sm shadow-sm transition-all duration-200
                    outline-none focus:ring-2 focus:ring-primary/50 text-left
                    ${canEdit ? 'cursor-pointer hover:scale-[1.02] hover:shadow-md' : 'cursor-not-allowed opacity-70'}
                    ${dish.isServed
                    ? 'bg-green-50 border-green-200 text-green-900'
                    : 'bg-white border-slate-200 hover:border-primary/40'}
                    ${isProcessing ? 'opacity-50' : ''}
                `}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <Badge variant="secondary" className="font-mono h-7 w-7 flex items-center justify-center p-0 shrink-0 bg-white border shadow-sm">
                        {dish.quantity}x
                    </Badge>
                    <span className="font-medium truncate" title={dish.name}>
                        {dish.name}
                    </span>
                </div>

                <div className="pl-2 shrink-0">
                    {renderStatusBadge()}
                </div>
            </button>
        </li>
    );
};

ReservationDishItem.propTypes = {
    dish: PropTypes.object.isRequired,
    canEdit: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    isProcessing: PropTypes.bool.isRequired,
};

// --- KOMPONENT 2: Karta Rezerwacji (TUTAJ ZMIANY) ---
const ReservationCard = ({ reservation, isExpanded, onToggleExpand, onDishToggle, processingDishId }) => {
    const isConfirmed = reservation.status === 'CONFIRMED';

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
            CONFIRMED: "bg-green-50 text-green-700 border-green-200",
            COMPLETED: "bg-slate-100 text-slate-600 border-slate-200",
            CANCELLED: "bg-red-50 text-red-700 border-red-200"
        };

        const labels = {
            PENDING: "Oczekiwanie",
            CONFIRMED: "Potwierdzona",
            COMPLETED: "Zakończona",
            CANCELLED: "Anulowana"
        };

        return <Badge variant="outline" className={styles[status] || ""}>{labels[status] || status}</Badge>;
    };

    const formatTime = (isoString) => new Date(isoString).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

    return (
        <Card className={`overflow-hidden transition-all duration-200 border-l-4 ${isConfirmed ? 'border-l-primary shadow-sm' : 'border-l-slate-300 opacity-80'}`}>
            <CardHeader className="bg-white cursor-pointer hover:bg-slate-50 transition-colors p-4 sm:p-5" onClick={() => onToggleExpand(reservation.id)}>
                <div className="flex justify-between items-center">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <div className="flex items-center gap-3">
                            {/* ZMIANA: Wyświetlanie zakresu godzin */}
                            <div className="bg-primary/10 text-primary p-2 rounded-lg font-bold text-sm min-w-[90px] text-center whitespace-nowrap">
                                {formatTime(reservation.start)} - {formatTime(reservation.end)}
                            </div>

                            <div className="flex flex-col">
                                <span className="font-bold text-gray-800 flex items-center gap-2">
                                    Stolik {reservation.tableNumber}
                                    {getStatusBadge(reservation.status)}
                                </span>
                                {/* ZMIANA: Poprawione wyświetlanie Imienia i Nazwiska (clientName z backendu) */}
                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                    <User className="h-3 w-3" /> {reservation.clientName || "Klient"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* ZMIANA: Usunięto ID rezerwacji */}
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="pt-0 pb-6 px-4 sm:px-6 bg-slate-50/30 border-t">
                    <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                        {reservation.dishes && reservation.dishes.length > 0 ? (
                            <div className="mb-2">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                                        <Utensils className="h-4 w-4" /> Zamówienie:
                                    </h4>
                                    <span className="text-[10px] text-gray-400 italic">* Kliknij, aby zmienić status</span>
                                </div>
                                <ul className="grid gap-3 sm:grid-cols-2">
                                    {reservation.dishes.map((dish) => (
                                        <ReservationDishItem
                                            key={dish.id}
                                            dish={dish}
                                            canEdit={isConfirmed}
                                            onToggle={(dishId) => onDishToggle(reservation.id, dishId)}
                                            isProcessing={processingDishId === dish.id}
                                        />
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 bg-white rounded border border-dashed text-gray-400 text-sm">
                                <AlertCircle className="h-6 w-6 mb-2 opacity-50" /> Brak zamówionych dań.
                            </div>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

ReservationCard.propTypes = {
    reservation: PropTypes.object.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    onToggleExpand: PropTypes.func.isRequired,
    onDishToggle: PropTypes.func.isRequired,
    processingDishId: PropTypes.number,
};

// --- KOMPONENT 3: Główna Strona ---
const WaiterReservationsPage = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("CONFIRMED");
    const [expandedIds, setExpandedIds] = useState([]);
    const [processingDishId, setProcessingDishId] = useState(null);

    const fetchReservations = useCallback(async () => {
        try {
            const data = await reservationService.getWaiterReservations();
            setReservations(data);
        } catch (error) {
            console.error(error);
            toast.error("Nie udało się pobrać Twoich rezerwacji.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchReservations();
    }, [fetchReservations]);

    const handleToggleDish = async (reservationId, dishId) => {
        setProcessingDishId(dishId);
        try {
            await reservationService.updateDishStatus(reservationId, dishId);
            setReservations(prevRes => toggleDishInList(prevRes, reservationId, dishId));
            toast.success("Zmieniono status dania.");
        } catch (error) {
            const msg = error.response?.data?.detail || "Błąd zmiany statusu.";
            toast.error(msg);
        } finally {
            setProcessingDishId(null);
        }
    };

    const toggleExpand = (id) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const filteredReservations = statusFilter === "ALL"
        ? reservations
        : reservations.filter(r => r.status === statusFilter);

    const getEmptyStateMessage = (filter) => {
        switch (filter) {
            case "CONFIRMED": return "Brak potwierdzonych stolików do obsłużenia.";
            case "COMPLETED": return "Brak zakończonych rezerwacji w historii.";
            case "ALL": return "Brak jakichkolwiek rezerwacji.";
            case "CANCELLED": return "Brak anulowanych rezerwacji.";
            default: return "Brak rezerwacji.";
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

    return (
        <div className="container mx-auto p-4 max-w-4xl min-h-[80vh]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
                    <Utensils className="h-8 w-8 text-primary" /> Moje Stoliki
                </h1>

                <div className="flex items-center gap-2 bg-white p-2 rounded-md border shadow-sm self-end sm:self-auto">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                        className="text-sm bg-transparent outline-none cursor-pointer font-medium text-gray-700 min-w-[130px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="CONFIRMED">Potwierdzone</option>
                        <option value="ALL">Wszystkie</option>
                        <option value="COMPLETED">Zakończone</option>
                        <option value="CANCELLED">Anulowane</option>
                    </select>
                </div>
            </div>

            {filteredReservations.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm">
                        <Utensils className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">
                        {getEmptyStateMessage(statusFilter)}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {filteredReservations.map((res) => (
                        <ReservationCard
                            key={res.id}
                            reservation={res}
                            isExpanded={expandedIds.includes(res.id)}
                            onToggleExpand={toggleExpand}
                            onDishToggle={handleToggleDish}
                            processingDishId={processingDishId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default WaiterReservationsPage;