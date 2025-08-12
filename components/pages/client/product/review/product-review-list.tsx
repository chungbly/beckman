"use client";
import ClientPagination from "@/components/app-layout/client-pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Comment } from "@/types/comment";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import moment from "moment-timezone";
import { useState } from "react";
import ImageCarousel from "../../../../image-carousel";
import StarRating from "../../../../product/star-rating";

function ListProductReview({ comments }: { comments: Comment[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPage = Math.ceil(comments.length / 5);
  return (
    <div className="space-y-6">
      {comments.map((review, index) => {
        if (index < (currentPage - 1) * 5) return null;
        if (index >= currentPage * 5) return null;
        return (
          <Card key={review._id} className="bg-transparent border-black/10">
            <CardContent className="p-2 sm:p-6 ">
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={review.avatar} />
                    <AvatarFallback>{review.author[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm sm:text-base flex items-center gap-2">
                      {review.author}
                      <Badge variant="secondary">Đã mua hàng</Badge>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {moment
                        .tz(review.createdAt, "Asia/Ho_Chi_Minh")
                        .format("DD/MM/yyyy")}
                    </div>
                  </div>
                </div>
                <div className="flex">
                  <StarRating rating={review.rating} />
                </div>
              </div>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                {review.content}
              </p>
              {!!review.images?.length && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {review.images.map((image, index) => (
                    <ImageCarousel
                      key={index}
                      images={[image]}
                      className="relative w-20 h-20 max-h-20 max-w-20"
                    />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {!!review.likes && review.likes}
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <ThumbsDown className="w-4 h-4" />
                  {!!review.dislikes && review.dislikes}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {totalPage > 1 && (
        <ClientPagination
          currentPage={currentPage}
          totalPage={totalPage}
          onChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
}

export default ListProductReview;
