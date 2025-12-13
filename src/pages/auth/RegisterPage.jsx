import { useForm } from "react-hook-form";
import axiosClient from "@/api/axiosClient.js";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card.jsx";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const RegisterPage = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            await axiosClient.post("/api/auth/register", {
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber
            });

            toast.success("Konto utworzone! Sprawdź swoją skrzynkę mailową, aby aktywować konto.", {
                autoClose: 8000,
            });

            navigate("/login");
        } catch (error) {
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.title ||
                "Błąd rejestracji. Spróbuj ponownie.";

            toast.error(errorMessage);
        }
    };
    const password = watch("password");

    return (
        <div className="flex justify-center items-center py-10 px-4 bg-gray-50 min-h-full">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Rejestracja</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Imię</Label>
                                <Input {...register("firstName", { required: "Wymagane" })} />
                                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Nazwisko</Label>
                                <Input {...register("lastName", { required: "Wymagane" })} />
                                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" {...register("email", {
                                required: "Wymagane",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Niepoprawny format email (np. jan@domena.pl)"
                                    }
                            })} />
                            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Telefon (9 cyfr)</Label>
                            <Input {...register("phoneNumber", {
                                required: "Wymagane",
                                pattern: { value: /^\d{9}$/, message: "Musi być 9 cyfr" }
                            })} />
                            {errors.phoneNumber && <p className="text-red-500 text-xs">{errors.phoneNumber.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Hasło (min. 6 znaków)</Label>
                            <Input type="password" {...register("password", {
                                required: "Wymagane",
                                minLength: { value: 6, message: "Min. 6 znaków" }
                            })} />
                            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Powtórz hasło</Label>
                            <Input type="password" {...register("confirmPassword", {
                                validate: v => v === password || "Hasła nie są identyczne"
                            })} />
                            {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Rejestracja..." : "Zarejestruj się"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-gray-500">Masz konto? <Link to="/login" className="text-primary hover:underline">Zaloguj się</Link></p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default RegisterPage;