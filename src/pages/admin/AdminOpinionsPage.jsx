import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { opinionService } from "@/api/opinionService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Trash2, Star, MessageSquareQuote, Loader2, User } from "lucide-react";
import { toast } from "react-toastify";

const AdminOpinionsPage = () => {
    const [opinions, setOpinions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const PAGE_SIZE = 10;

    const loadOpinions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await opinionService.getAllOpinions(page, PAGE_SIZE);
            setOpinions(data.content);
            setTotalPages(data.totalPages);
        } catch {
            toast.error("Błąd pobierania opinii.");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        void loadOpinions();
    }, [loadOpinions]);

    const handleDelete = async (id) => {
        if (!confirm("Czy na pewno chcesz usunąć tę opinię?")) return;
        try {
            await opinionService.deleteOpinion(id);
            toast.success("Usunięto opinię.");
            void loadOpinions();
        } catch {
            toast.error("Nie udało się usunąć opinii.");
        }
    };

    const renderStars = (rating) => (
        <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-current" : "text-gray-300"}`} />
            ))}
        </div>
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("pl-PL", {
            year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
        });
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/admin">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        Moderacja Opinii <MessageSquareQuote className="h-8 w-8 text-primary" />
                    </h1>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin h-10 w-10 text-primary" />
                </div>
            ) : (
                <div className="space-y-4">
                    {opinions.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 border border-dashed rounded-xl text-gray-400">
                            Brak opinii na tej stronie.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {opinions.map((opinion) => (
                                <Card key={opinion.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-2 bg-slate-50/50 border-b p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white p-2 rounded-full border shadow-sm text-gray-600">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm">
                                                        {opinion.userFirstName} {opinion.userLastName}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatDate(opinion.createdAt)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {renderStars(opinion.rating)}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                                    onClick={() => handleDelete(opinion.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 p-4">
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            "{opinion.content}"
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" /> Poprzednia
                            </Button>

                            <span className="text-sm font-medium text-gray-600">
                                Strona {page + 1} z {totalPages}
                            </span>

                            <Button
                                variant="outline"
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                            >
                                Następna <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminOpinionsPage;