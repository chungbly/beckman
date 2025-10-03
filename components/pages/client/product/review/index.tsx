"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Comment } from "@/types/comment";
import { useState } from "react";
import StarRating from "../../../../product/star-rating";
import ListProductReview from "./product-review-list";

function ProductReviews({ comments }: { comments: Comment[] }) {
  const [stars, setStars] = useState([1, 2, 3, 4, 5]);
  const average =
    comments.reduce((acc, comment) => acc + comment.rating || 0, 0) /
      comments.length || 5;
  const total = comments.length;
  const distribution = [
    { stars: 1, count: 0 },
    { stars: 2, count: 0 },
    { stars: 3, count: 0 },
    { stars: 4, count: 0 },
    { stars: 5, count: 0 },
  ];
  comments.forEach((comment) => {
    distribution[comment.rating - 1].count++;
  });

  return (
    <div className="scroll-mt-24 p-2 bg-white">
      <div className="space-y-6">
        {/* Review Summary */}
        <div className="flex flex-col md:flex-row gap-8 p-4 sm:p-6 bg-secondary/50 rounded-lg">
          <div className="text-center md:w-1/3">
            <div className="text-4xl font-bold mb-2">{average.toFixed(1)}</div>
            <div className="flex justify-center mb-2">
              <StarRating rating={average} />
            </div>
            <div className="text-sm text-muted-foreground">
              {total} đánh giá
            </div>
          </div>
          <div className="flex-1">
            {distribution.reverse().map((dist, index) => (
              <div
                key={index}
                className="flex items-center gap-4 mb-2 cursor-pointer"
                onClick={() => {
                  if (stars.includes(dist.stars)) {
                    setStars(stars.filter((s) => s !== dist.stars));
                  } else {
                    setStars([...stars, dist.stars]);
                  }
                }}
              >
                <Checkbox checked={stars.includes(dist.stars)} />
                <div className="w-12 text-sm min-w-max">{dist.stars} sao</div>
                <Progress
                  value={(dist.count / total) * 100}
                  className="h-2 bg-transparent"
                  indicatorClassName="bg-[var(--gray-beige)]"
                />
                <div className="w-12 text-sm text-muted-foreground">
                  {dist.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review List */}
        <ListProductReview
          comments={comments.filter((c) => {
            return stars.includes(c.rating);
          })}
        />
      </div>
    </div>
  );
}

export default ProductReviews;
