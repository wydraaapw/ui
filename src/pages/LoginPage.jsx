import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import axiosClient from "@/api/axiosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // <--- Import

const LoginPage = () => {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            const res = await axiosClient.post("/api/auth/login", data);

            login(res.data.token, res.data.user);
            toast.success(`Witaj ponownie, ${res.data.user.firstName}!`);
            navigate("/dashboard");

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
                            <Input type="email" {...register("email", { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Hasło</Label>
                                <Link to="/forgot-password" class="text-xs text-primary hover:underline">Zapomniałeś hasła?</Link>
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