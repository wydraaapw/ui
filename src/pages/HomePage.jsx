import { Button } from "@/components/ui/button.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";

const HomePage = () => {
    const { user } = useAuth();

    return (
        <div className="bg-slate-50 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4 py-12">

            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Prawdziwy smak <br /> <span className="text-primary">w Twoim mieście</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl mb-10">
                Odkryj nasze wyjątkowe jedzenie, przygotowywane z pasją ze świeżych, lokalnych składników.
                Zamów online i odbierz w lokalu przy ul. Smacznej 15.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button size="lg" className="px-8 text-lg" asChild>
                    <Link to="/menu">Zobacz Menu</Link>
                </Button>


                {user ? (
                    <Button size="lg" variant="outline" className="px-8 text-lg border-primary text-primary hover:bg-primary/10" asChild>
                        <Link to="/reservations">Zarezerwuj stolik</Link>
                    </Button>
                ) : (
                    <Button size="lg" variant="outline" className="px-8 text-lg" asChild>
                        <Link to="/register">Załóż konto</Link>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default HomePage;