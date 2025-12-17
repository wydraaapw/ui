import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { ChevronLeft, Check, X, CheckCheck, UserCog, Filter } from "lucide-react";
import { toast } from "react-toastify";
import { adminReservationService } from "@/api/adminReservationService.js";

const AdminReservationsPage = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState("ALL");

    const [isWaiterDialogOpen, setIsWaiterDialogOpen] = useState(false);
    const [selectedReservationId, setSelectedReservationId] = useState(null);
    const [availableWaiters, setAvailableWaiters] = useState([]);
    const [loadingWaiters, setLoadingWaiters] = useState(false);

    const loadReservations = async () => {
        setLoading(true);
        try {
            const data = await adminReservationService.getAllReservations();
            setReservations(data);
        } catch {
            toast.error("Błąd pobierania rezerwacji.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadReservations();
    }, []);

    const filteredReservations = statusFilter === "ALL"
        ? reservations
        : reservations.filter(r => r.status === statusFilter);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await adminReservationService.updateStatus(id, newStatus);
            void loadReservations();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Błąd zmiany statusu.");
        }
    };

    const openWaiterDialog = async (reservationId) => {
        setSelectedReservationId(reservationId);
        setIsWaiterDialogOpen(true);
        setLoadingWaiters(true);
        try {
            const waiters = await adminReservationService.getAvailableWaiters(reservationId);
            setAvailableWaiters(waiters);
        } catch {
            toast.error("Nie udało się pobrać listy kelnerów.");
            setAvailableWaiters([]);
        } finally {
            setLoadingWaiters(false);
        }
    };

    const handleAssignWaiter = async (waiterId) => {
        try {
            await adminReservationService.assignWaiter(selectedReservationId, waiterId);
            setIsWaiterDialogOpen(false);
            void loadReservations();
        } catch {
            toast.error("Błąd przypisywania kelnera.");
        }
    };

    const formatDate = (startStr, endStr) => {
        if (!startStr || !endStr) return <span className="text-gray-400">Brak daty</span>;
        const start = new Date(startStr);
        const end = new Date(endStr);

        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

        return (
            <div className="flex flex-col text-sm">
                <span className="font-bold">{start.toLocaleDateString('pl-PL')}</span>
                <span className="text-gray-500">
                    {start.toLocaleTimeString('pl-PL', timeOptions)} - {end.toLocaleTimeString('pl-PL', timeOptions)}
                </span>
            </div>
        );
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "PENDING":
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">OCZEKUJĄCA</Badge>;
            case "CONFIRMED":
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">POTWIERDZONA</Badge>;
            case "COMPLETED":
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">ZAKOŃCZONA</Badge>;
            case "CANCELLED":
                return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">ANULOWANA</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const renderWaitersContent = () => {
        if (loadingWaiters) {
            return (
                <div className="text-center text-sm text-gray-500">
                    Sprawdzanie grafiku...
                </div>
            );
        }

        if (availableWaiters.length === 0) {
            return (
                <div className="text-center text-red-500 text-sm font-medium bg-red-50 p-4 rounded">
                    Brak dostępnych kelnerów w tym terminie! <br/>
                    <span className="text-xs font-normal text-gray-600">Dodaj zmianę w Zarządzaniu Kelnerami.</span>
                </div>
            );
        }

        return (
            <div className="grid gap-2">
                {availableWaiters.map(waiter => (
                    <Button
                        key={waiter.id}
                        variant="outline"
                        className="justify-start h-auto py-3"
                        onClick={() => handleAssignWaiter(waiter.id)}
                    >
                        <div className="text-left">
                            <div className="font-bold">{waiter.firstName} {waiter.lastName}</div>
                            <div className="text-xs text-gray-500">{waiter.email}</div>
                        </div>
                    </Button>
                ))}
            </div>
        );
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link to="/admin">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">Rezerwacje 📅</h1>
                </div>

                <div className="flex items-center gap-2 bg-white p-2 rounded-md border shadow-sm">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                        className="text-sm bg-transparent outline-none cursor-pointer font-medium text-gray-700 min-w-[150px]"
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

            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Lista rezerwacji</span>
                        <span className="text-sm font-normal text-gray-500">
                            {filteredReservations.length} {filteredReservations.length === 1 ? 'wynik' : 'wyników'}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-10">Ładowanie...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-slate-50">
                                <tr>
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Klient</th>
                                    <th className="p-3">Termin</th>
                                    <th className="p-3">Stolik</th>
                                    <th className="p-3">Kelner</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Akcje</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y">
                                {filteredReservations.length === 0 && (
                                    <tr><td colSpan="7" className="p-6 text-center text-gray-500">Brak rezerwacji spełniających kryteria.</td></tr>
                                )}
                                {filteredReservations.map((res) => (
                                    <tr key={res.id} className="hover:bg-slate-50">
                                        <td className="p-3 font-mono text-gray-500">#{res.id}</td>
                                        <td className="p-3">
                                            <div className="font-medium">{res.clientName}</div>
                                            <div className="text-xs text-gray-500">{res.clientEmail}</div>
                                        </td>
                                        <td className="p-3">{formatDate(res.start, res.end)}</td>
                                        <td className="p-3">
                                            Stolik {res.tableNumber} <br/>
                                            <span className="text-xs text-gray-400">({res.seats} os.)</span>
                                        </td>

                                        <td className="p-3">
                                            <div className="flex items-center justify-between gap-2 max-w-[220px]">
                                                <div className="text-sm truncate">
                                                    {res.waiterId ? (
                                                        <span className="font-medium text-gray-700">{res.waiterName}</span>
                                                    ) : (
                                                        <span className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded font-bold border border-red-100">
                                                            Brak kelnera
                                                        </span>
                                                    )}
                                                </div>

                                                {res.status !== 'CANCELLED' && res.status !== 'COMPLETED' && (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 shrink-0 border-dashed border-slate-300 text-slate-500 hover:text-primary hover:border-primary bg-white"
                                                        onClick={() => openWaiterDialog(res.id)}
                                                        title={res.waiterId ? "Zmień kelnera" : "Przypisz kelnera"}
                                                    >
                                                        <UserCog className="h-4 w-4"/>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-3">{getStatusBadge(res.status)}</td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                {res.status === 'PENDING' && (
                                                    <>
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8"
                                                                onClick={() => handleStatusChange(res.id, 'CONFIRMED')} title="Zatwierdź">
                                                            <Check className="h-4 w-4 mr-1"/> OK
                                                        </Button>
                                                        <Button size="sm" variant="destructive" className="h-8"
                                                                onClick={() => handleStatusChange(res.id, 'CANCELLED')} title="Odrzuć">
                                                            <X className="h-4 w-4"/>
                                                        </Button>
                                                    </>
                                                )}
                                                {res.status === 'CONFIRMED' && (
                                                    <>
                                                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 h-8"
                                                                onClick={() => handleStatusChange(res.id, 'COMPLETED')} title="Zakończ wizytę">
                                                            <CheckCheck className="h-4 w-4 mr-1"/> ZAKOŃCZ
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 h-8"
                                                                onClick={() => handleStatusChange(res.id, 'CANCELLED')}>
                                                            Anuluj
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isWaiterDialogOpen} onOpenChange={setIsWaiterDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Przypisz kelnera</DialogTitle>
                        <DialogDescription>
                            Wybierz kelnera, który obsłuży tę rezerwację. Lista zawiera tylko osoby mające zmianę w tym terminie.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {renderWaitersContent()}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminReservationsPage;