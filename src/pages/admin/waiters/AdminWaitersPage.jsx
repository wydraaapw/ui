import { useState } from "react";
import WaiterManager from "./WaiterManager";
import ShiftManager from "./ShiftManager";
import { Button } from "@/components/ui/button";

const AdminWaitersPage = () => {
    const [activeTab, setActiveTab] = useState("waiters");

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <h1 className="text-3xl font-bold mb-6">Zarządzanie Personelem 👥</h1>

            <div className="flex gap-2 mb-8 border-b pb-4">
                <Button
                    variant={activeTab === "waiters" ? "default" : "ghost"}
                    onClick={() => setActiveTab("waiters")}
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
                {activeTab === "waiters" && <WaiterManager />}

                {activeTab === "shifts" && <ShiftManager />}
            </div>
        </div>
    );
};

export default AdminWaitersPage;