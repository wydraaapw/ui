import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";

const ActivationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");


    const initialState = !token
        ? { status: "error", message: "Link jest nieprawidłowy (brak tokena)." }
        : { status: "loading", message: "Weryfikacja tokena..." };


    const [state, setState] = useState(initialState);

    const effectCalled = useRef(false);

    useEffect(() => {
        if (!token) {
            return;
        }

        if (effectCalled.current) return;
        effectCalled.current = true;

        const activateAccount = async () => {
            try {
                const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/auth/activate?token=${token}`;

                await axios.get(url);

                setState({
                    status: "success",
                    message: "Konto zostało pomyślnie aktywowane!"
                });

                toast.success("Konto aktywowane!");

                localStorage.removeItem('token');

            } catch (error) {
                console.error("Błąd aktywacji:", error);


                const errorData = error.response?.data;
                const msg = errorData?.detail || errorData?.error || "Link wygasł lub jest niepoprawny.";

                setState({
                    status: "error",
                    message: msg
                });
            }
        };

        void activateAccount();


    }, [token]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
            <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Aktywacja Konta 🔐</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6 py-6">

                    {state.status === "loading" && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            <p className="text-muted-foreground">Trwa sprawdzanie linku...</p>
                        </div>
                    )}

                    {state.status === "success" && (
                        <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-green-700">Sukces!</h3>
                            <p className="text-gray-600">{state.message}</p>
                            <Button className="w-full mt-4" onClick={() => navigate("/login")}>
                                Przejdź do logowania
                            </Button>
                        </div>
                    )}

                    {state.status === "error" && (
                        <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-red-700">Błąd</h3>
                            <p className="text-gray-600">{state.message}</p>
                            <p className="text-sm text-gray-500">Jeśli masz już aktywne konto, po prostu się zaloguj.</p>
                            <div className="flex gap-2 w-full justify-center">
                                <Button variant="secondary" onClick={() => navigate("/login")}>
                                    Przejdź do logowania
                                </Button>
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
};

export default ActivationPage;