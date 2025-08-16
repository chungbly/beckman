import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  className?: string;
}

export default function StarRating({ rating, className }: StarRatingProps) {
  return (
    <div className={cn("flex", className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const remainingRating = rating - i;
        const fillPercentage = Math.min(Math.max(remainingRating, 0), 1) * 100;

        return (
          <div key={i} className="relative w-4 h-4">
            <svg className="w-4 h-4 fill-transparent stroke-[#CD7F32]" viewBox="0 0 24 24">

              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <svg
                className="w-4 h-4 fill-[#CD7F32]"
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
