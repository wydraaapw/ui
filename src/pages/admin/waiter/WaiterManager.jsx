import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, UserPlus, Loader2, Languages, Phone, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { adminWaiterService } from "@/api/adminWaiterService.js";

const WaiterManager = () => {
    const [waiters, setWaiters] = useState([]);
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

    const loadWaiters = async () => {
        try {
            const data = await adminWaiterService.getAllWaiters();
            setWaiters(data);
        } catch{
            toast.error("Błąd pobierania listy pracowników.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadWaiters();
    }, []);

    const onSubmit = async (data) => {
        try {
            await adminWaiterService.createWaiter(data);
            toast.success("Kelner zatrudniony pomyślnie!");
            reset();
            void loadWaiters();
        } catch (error) {
            const msg = error.response?.data?.detail || "Błąd podczas dodawania pracownika.";
            toast.error(msg);
        }
    };

    const handleDelete = async (id) => {
        if (!globalThis.confirm("Czy na pewno chcesz usunąć to konto? To operacja nieodwracalna.")) return;
        try {
            await adminWaiterService.deleteWaiter(id);
            toast.success("Pracownik usunięty.");
            void loadWaiters();
        } catch (error) {
            toast.error(error.response?.data?.detail);
        }
    };

    if (loading) return <div className="text-center py-10"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary"/></div>;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Zatrudnij Nowego Kelnera 🤵</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Imię</Label>
                                <Input {...register("firstName", { required: "Wymagane" })} placeholder="Jan" />
                                {errors.firstName && <span className="text-red-500 text-xs">To pole jest wymagane</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Nazwisko</Label>
                                <Input {...register("lastName", { required: "Wymagane" })} placeholder="Kowalski" />
                                {errors.lastName && <span className="text-red-500 text-xs">To pole jest wymagane</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email (Login)</Label>
                                <Input
                                    type="email"
                                    {...register("email", {
                                        required: "Wymagane",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Niepoprawny format email (np. jan@domena.pl)"
                                        }
                                    })}
                                    placeholder="jan.kowalski@restauracja.pl"
                                />
                                {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Telefon (9 cyfr)</Label>
                                <Input {...register("phoneNumber", { required: "Wymagane", pattern: /^\d{9}$/ })} placeholder="123456789" />
                                {errors.phoneNumber && <span className="text-red-500 text-xs">Wymagane 9 cyfr</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Hasło startowe (min. 6 znaków)</Label>
                            <Input type="password" {...register("password", { required: "Wymagane", minLength: 6 })} placeholder="******" />
                            {errors.password && <span className="text-red-500 text-xs">Min. 6 znaków</span>}
                        </div>

                        <div className="flex items-center space-x-2 py-2">
                            <input
                                type="checkbox"
                                id="speaksEnglish"
                                {...register("speaksEnglish")}
                                className="accent-primary h-4 w-4"
                            />
                            <Label htmlFor="speaksEnglish" className="cursor-pointer">Mówi po angielsku 🇬🇧</Label>
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Zatrudnianie..." : <><UserPlus className="mr-2 h-4 w-4"/> Utwórz Konto</>}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Twój Zespół ({waiters.length})</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {waiters.length === 0 && <p className="text-gray-500 col-span-full">Brak zatrudnionych kelnerów.</p>}

                    {waiters.map((waiter) => (
                        <Card key={waiter.id} className="hover:shadow-md transition">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{waiter.firstName} {waiter.lastName}</CardTitle>
                                        <p className="text-xs text-gray-500 mt-1">Zatrudniony: {waiter.hireDate}</p>
                                    </div>
                                    <div className="bg-slate-100 p-2 rounded-full">
                                        <span className="text-2xl">🤵</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="h-4 w-4"/> {waiter.email}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="h-4 w-4"/> {waiter.phoneNumber}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Languages className="h-4 w-4"/>
                                    {waiter.speaksEnglish ? <span className="text-green-600 font-medium">Angielski: TAK</span> : <span className="text-gray-400">Angielski: NIE</span>}
                                </div>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="w-full mt-4 bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none"
                                    onClick={() => handleDelete(waiter.id)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Zwolnij
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WaiterManager;