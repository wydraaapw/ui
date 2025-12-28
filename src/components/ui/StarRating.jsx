import { Star } from "lucide-react";

export const StarRating = ({ rating }) => {
    return (
        <div className="flex text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${i < rating ? "fill-current" : "text-gray-300"}`}
                />
            ))}
        </div>
    );
};