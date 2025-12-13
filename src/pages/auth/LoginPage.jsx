import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext.jsx";
import axiosClient from "@/api/axiosClient.js";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card.jsx";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginPage = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            const res = await axiosClient.post("/api/auth/login", data);
            const user = res.data.user;

            login(res.data.token, user);
            toast.success(`Witaj ponownie, ${user.firstName}!`);

            if (user.role === 'ROLE_ADMIN') {
                navigate("/admin");
            } else if (user.role === 'ROLE_WAITER') {
                navigate("/waiter-panel");
            } else {
                navigate("/client");
            }

        } catch (error) {
            console.error("Login error:", error);

            let message = "Wystąpił błąd logowania.";

            if (error.response) {
                const { status, data } = error.response;

                if (data?.detail) {
                    message = data.detail;
                }
                else if (status === 404) {
                    message = "Nie znaleziono użytkownika o takim adresie email.";
                } else if (status === 401) {
                    message = "Nieprawidłowe hasło.";
                } else if (status === 403) {
                    message = "Konto nie jest aktywne. Sprawdź email.";
                }
            } else {
                message = "Błąd połączenia z serwerem.";
            }

            toast.error(message);
        }
    };

    return (
        <div className="flex justify-center items-center py-10 px-4 bg-gray-50 min-h-full">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Logowanie</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                {...register("email", {
                                    required: "Email jest wymagany",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Niepoprawny format email (np. jan@domena.pl)"
                                    }
                                })}
                            />
                            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Hasło</Label>
                                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Zapomniałeś hasła?</Link>
                            </div>
                            <Input type="password" {...register("password", { required: true })} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Logowanie..." : "Zaloguj się"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-gray-500">Nie masz konta? <Link to="/register" className="text-primary hover:underline">Zarejestruj się</Link></p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;