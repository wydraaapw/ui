import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Users, LayoutGrid } from "lucide-react";

export default function AdminPanel() {
    const { user } = useAuth();

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Panel Administratora 🛠️</h1>
                <div className="text-sm text-muted-foreground">
                    Zalogowany jako: <span className="font-medium text-foreground">{user?.firstName}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium">Menu Restauracji</CardTitle>
                        <Utensils className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Zarządzaj kategoriami, składnikami oraz daniami widocznymi dla klientów.
                        </p>
                        <Button asChild className="w-full">
                            <Link to="/admin/menu">Zarządzaj Menu</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow opacity-60">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium">Sala i Stoliki</CardTitle>
                        <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Konfiguruj układ sali i liczbę miejsc (Wkrótce).
                        </p>
                        <Button variant="outline" className="w-full" disabled>Wkrótce</Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow opacity-60">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium">Personel</CardTitle>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Zarządzaj kelnerami i ich grafikami (Wkrótce).
                        </p>
                        <Button variant="outline" className="w-full" disabled>Wkrótce</Button>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}