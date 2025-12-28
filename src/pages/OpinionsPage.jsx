import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext.jsx";
import { opinionService } from "@/api/opinionService.js";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Star, User, MessageSquare, Loader2, Send, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const OpinionsPage = () => {
    const { user } = useAuth();
    const [opinions, setOpinions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const PAGE_SIZE = 6;

    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

    const isClient = user?.role === 'ROLE_CLIENT';

    const loadOpinions = useCallback(async (pageNumber, append = false) => {
        setLoading(true);
        try {
            const data = await opinionService.getAllOpinions(pageNumber, PAGE_SIZE);

            if (append) {
                setOpinions(prev => [...prev, ...data.content]);
            } else {
                setOpinions(data.content);
            }

            const totalPages = data.page?.totalPages || data.totalPages || 0;
            const currentNum = data.page?.number ?? data.number ?? 0;
            setHasNextPage((currentNum + 1) < totalPages);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadOpinions(0);
    }, [loadOpinions]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        void loadOpinions(nextPage, true);
    };

    const onSubmit = async (data) => {
        if (!user) return;

        try {
            const payload = {
                content: data.content,
                rating: rating,
                createdAt: new Date().toISOString()
            };

            await opinionService.createOpinion(payload);
            toast.success("Dziękujemy za opinię!");
            reset();
            setRating(5);

            setPage(0);
            void loadOpinions(0, false);
        } catch (error) {
            const msg = error.response?.data?.detail || "Nie udało się dodać opinii.";
            toast.error(msg);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pl-PL", {
            year: "numeric", month: "long", day: "numeric"
        }).format(date);
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl min-h-[80vh] space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2 mb-10">
                <h1 className="text-4xl font-extrabold text-primary flex justify-center items-center gap-3">
                    <MessageSquare className="h-8 w-8" /> Wasze Opinie
                </h1>
                <p className="text-gray-500">
                    Zobacz, co inni sądzą o naszej kuchni i atmosferze.
                </p>
            </div>

            {isClient && (
                <Card className="border-primary/20 shadow-md bg-slate-50/50 mb-10">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            ✨ Dodaj swoją opinię
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-gray-700">Twoja ocena:</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className="focus:outline-none transition-transform hover:scale-110"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                        >
                                            <Star
                                                className={`h-8 w-8 transition-colors ${
                                                    star <= (hoverRating || rating)
                                                        ? "text-yellow-400 fill-yellow-400"
                                                        : "text-gray-300"
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <textarea
                                    className={`flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.content ? "border-red-500" : ""}`}
                                    placeholder="Napisz kilka słów..."
                                    {...register("content", {
                                        required: "Treść opinii jest wymagana",
                                        maxLength: { value: 500, message: "Maksymalnie 500 znaków" }
                                    })}
                                />
                                {errors.content && <p className="text-red-500 text-xs">{errors.content.message}</p>}
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Wysyłanie..." : <><Send className="mr-2 h-4 w-4"/> Opublikuj</>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {opinions.length === 0 && !loading ? (
                <div className="col-span-full text-center py-12 text-gray-400 border rounded-xl border-dashed">
                    Brak opinii. Bądź pierwszy!
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {opinions.map((op) => (
                        <Card key={op.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/40">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-100 p-2 rounded-full text-slate-600">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">
                                                {op.userFirstName} {op.userLastName?.charAt(0)}.
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {formatDate(op.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <RenderStars count={op.rating} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 italic leading-relaxed text-sm">
                                    "{op.content}"
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
            )}

            {hasNextPage && !loading && (
                <div className="flex justify-center mt-8">
                    <Button variant="outline" onClick={handleLoadMore}>
                        <ChevronDown className="mr-2 h-4 w-4" /> Załaduj więcej opinii
                    </Button>
                </div>
            )}
        </div>
    );
};

const RenderStars = ({ count }) => (
    <div className="flex text-yellow-400">
        {Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < count ? "fill-current" : "text-gray-300"}`}
            />
        ))}
    </div>
);

RenderStars.propTypes = {
    count: PropTypes.number.isRequired,
};

export default OpinionsPage;