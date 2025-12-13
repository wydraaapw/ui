import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosClient from "@/api/axiosClient.js";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { toast } from "react-toastify";

const ResetPasswordPage = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const onSubmit = async (data) => {
        try {
            await axiosClient.post("/api/auth/reset-password", {
                token: token,
                newPassword: data.password
            });
            toast.success("Hasło zmienione pomyślnie!");
            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.error || "Błąd zmiany hasła");
        }
    };

    const password = watch("password");

    if (!token) return <p className="text-center mt-10 text-red-500">Brak tokena resetującego.</p>;

    return (
        <div className="flex justify-center items-center py-10 px-4">
            <Card className="w-full max-w-md">
                <CardHeader><CardTitle>Ustaw nowe hasło</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input type="password" placeholder="Nowe hasło" {...register("password", { required: true, minLength: 6 })} />
                        {errors.password && <p className="text-red-500 text-xs">Min. 6 znaków</p>}

                        <Input type="password" placeholder="Powtórz hasło" {...register("confirm", { validate: v => v === password || "Różne hasła" })} />
                        {errors.confirm && <p className="text-red-500 text-xs">Hasła muszą być identyczne</p>}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>Zmień hasło</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;