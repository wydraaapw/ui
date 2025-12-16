import { useState } from "react";
import { Link } from "react-router-dom";
import WaiterManager from "./WaiterManager";
import ShiftManager from "./ShiftManager";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const AdminWaitersPage = () => {
    const [activeTab, setActiveTab] = useState("waiter");

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/admin">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">Zarządzanie Personelem 👥</h1>
            </div>

            <div className="flex gap-2 mb-8 border-b pb-4">
                <Button
                    variant={activeTab === "waiter" ? "default" : "ghost"}
                    onClick={() => setActiveTab("waiter")}
                >
                    Kelnerzy
                </Button>
                <Button
                    variant={activeTab === "shifts" ? "default" : "ghost"}
                    onClick={() => setActiveTab("shifts")}
                >
                    Grafik Pracy
                </Button>
            </div>

            <div className="animate-in fade-in duration-300">
                {activeTab === "waiter" && <WaiterManager />}

                {activeTab === "shifts" && <ShiftManager />}
            </div>
        </div>
    );
};

export default AdminWaitersPage;