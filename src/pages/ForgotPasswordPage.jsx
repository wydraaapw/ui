import { useForm } from "react-hook-form";
import axiosClient from "@/api/axiosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";

const ForgotPasswordPage = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        try {
            await axiosClient.post("/api/auth/forgot-password", data);

            toast.success("Jeśli konto z podanym adresem email istnieje, link do resetu hasła został wysłany.", {
                autoClose: 5000
            });

        } catch {
            toast.error("Wystąpił problem z wysłaniem żądania.");
        }
    };

    return (
        <div className="flex justify-center items-center py-10 px-4 min-h-[50vh]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Reset Hasła 🔒</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <p className="text-sm text-gray-600 text-center mb-4">
                            Podaj adres email powiązany z Twoim kontem. <br/>
                            Wyślemy na niego link umożliwiający ustawienie nowego hasła.
                        </p>

                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Twój adres email"
                                {...register("email", {
                                    required: "Podanie adresu email jest wymagane",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Niepoprawny format email (np. jan@domena.pl)"
                                    }
                                })}
                            />
                            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Wysyłanie..." : "Wyślij link resetujący"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;