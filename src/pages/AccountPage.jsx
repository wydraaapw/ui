import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { accountService } from "@/api/accountService.js";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.jsx";
import { User, Lock, ShieldCheck, Mail, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const AccountPage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm();

    const newPassword = watch("newPassword");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await accountService.getMyProfile();
                setUser(data);
            } catch {
                toast.error("Nie udało się pobrać danych profilu.");
            } finally {
                setLoading(false);
            }
        };
        void loadProfile();
    }, []);

    const onSubmitPasswordChange = async (data) => {
        try {
            await accountService.changePassword({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword
            });
            toast.success("Hasło zostało zmienione pomyślnie!");
            reset();
        } catch (error) {
            const msg = error.response?.data?.detail ||
                error.response?.data?.error ||
                "Nie udało się zmienić hasła (sprawdź stare hasło).";
            toast.error(msg);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
    }

    if (!user) return null;

    const getRoleName = (role) => {
        switch(role) {
            case 'ROLE_ADMIN': return 'Administrator';
            case 'ROLE_WAITER': return 'Kelner';
            case 'ROLE_CLIENT': return 'Klient';
            default: return role;
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-6">
                <User className="h-8 w-8 text-primary" /> Moje Konto
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Karta Informacyjna */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Dane osobowe</CardTitle>
                        <CardDescription>Informacje o Twoim profilu</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border">
                            <div className="bg-primary/10 p-3 rounded-full text-primary">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Imię i Nazwisko</p>
                                <p className="font-medium text-lg">{user.firstName} {user.lastName}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border">
                            <div className="bg-primary/10 p-3 rounded-full text-primary">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Adres Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border">
                            <div className="bg-primary/10 p-3 rounded-full text-primary">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Rola w systemie</p>
                                <p className="font-medium">{getRoleName(user.role)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Bezpieczeństwo</CardTitle>
                        <CardDescription>Zmień swoje hasło do logowania</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmitPasswordChange)} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Aktualne hasło</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="password"
                                        className="pl-9"
                                        placeholder="••••••"
                                        {...register("oldPassword", { required: "Podaj stare hasło" })}
                                    />
                                </div>
                                {errors.oldPassword && <p className="text-red-500 text-xs">{errors.oldPassword.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Nowe hasło</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="password"
                                        className="pl-9"
                                        placeholder="Min. 6 znaków"
                                        {...register("newPassword", {
                                            required: "Podaj nowe hasło",
                                            minLength: { value: 6, message: "Min. 6 znaków" }
                                        })}
                                    />
                                </div>
                                {errors.newPassword && <p className="text-red-500 text-xs">{errors.newPassword.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Powtórz nowe hasło</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="password"
                                        className="pl-9"
                                        placeholder="••••••"
                                        {...register("confirmPassword", {
                                            validate: value => value === newPassword || "Hasła muszą być takie same"
                                        })}
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
                            </div>

                            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                                {isSubmitting ? "Zmienianie..." : "Zmień hasło"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AccountPage;