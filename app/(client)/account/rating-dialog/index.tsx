"use client";

import { APIStatus } from "@/client/callAPI";
import { deleteFiles, uploadFile } from "@/client/cloudinary.client";
import { createComment } from "@/client/comment.client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Customer } from "@/types/customer";
import { ExternalOrder } from "@/types/external-order";
import { Order } from "@/types/order";
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/number";
import { CheckCircle, Star, Ticket, Upload, X } from "lucide-react";
import * as React from "react";

export function ProductRatingDialog({
  product,
  customer,
  internalOrder,
  externalOrder,
}: {
  product: Product & {
    isRated?: boolean;
  };
  customer: Customer;
  internalOrder?: Order;
  externalOrder?: ExternalOrder;
}) {
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [hoveredRating, setHoveredRating] = React.useState(0);
  const [review, setReview] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadedImages, setUploadedImages] = React.useState<FileList | null>(
    null
  );
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Create a new FileList with existing files plus new ones (max 3)
      const existingCount = uploadedImages?.length || 0;
      const availableSlots = 3 - existingCount;

      if (availableSlots > 0) {
        setUploadedImages(files);

        // Create preview URLs
        Array.from(files)
          .slice(0, availableSlots)
          .forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              setImagePreviews((prev) =>
                [...prev, e.target?.result as string].slice(0, 3)
              );
            };
            reader.readAsDataURL(file);
          });
      }
    }
  };

  const removeImage = (index: number) => {
    if (uploadedImages) {
      // Convert FileList to Array, remove item, then create new FileList-like structure
      const filesArray = Array.from(uploadedImages);
      filesArray.splice(index, 1);

      // Create a new DataTransfer to build a new FileList
      const dt = new DataTransfer();
      filesArray.forEach((file) => dt.items.add(file));
      setUploadedImages(dt.files);
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length > 0) {
      const input = document.createElement("input");
      input.type = "file";
      input.files = e.dataTransfer.files;
      handleImageUpload({ target: input } as any);
    }
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async () => {
    if (!customer) {
      return toast({
        title: "Đã có lỗi xảy ra",
        description: "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn",
        variant: "error",
      });
    }
    if (rating > 0) {
      setIsUploading(true);
      const images = [];
      const imageIds = [];
      if (uploadedImages?.length) {
        const res = await uploadFile(uploadedImages, "customer-review");
        if (res.status !== APIStatus.OK || !res.data?.length) {
          setIsUploading(false);
          return toast({
            title: "Đã có lỗi xảy ra",
            description: res?.message || "Vui lòng thử lại sau",
            variant: "error",
          });
        }
        images.push(...res.data.map((i) => i.url));
        imageIds.push(...res.data.map((i) => i._id));
      }
      const res = await createComment({
        images,
        author: customer.name || customer.phoneNumbers?.[0],
        rating,
        content: review,
        customerId: customer._id,
        productId: product.kvId,
        internalOrderCode: internalOrder?.code,
        externalOrderCode: externalOrder?.code,
      });
      if (res.status !== APIStatus.OK) {
        deleteFiles(imageIds);
        setIsUploading(false);
        return toast({
          title: "Đã có lỗi xảy ra",
          description: res?.message || "Vui lòng thử lại sau",
          variant: "error",
        });
      }

      setIsUploading(false);
      toast({
        title: "Đánh giá thành công",
        description: "Cảm ơn bạn đã đánh giá sản phẩm của chúng tôi",
        variant: "success",
      });
      setIsSubmitted(true);

      // Close dialog after a short delay
      setTimeout(() => {
        setOpen(false);
        setRating(0);
        setReview("");
        setUploadedImages(null);
        setImagePreviews([]);
      }, 2000);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "Rate this product";
    }
  };

  if (isSubmitted || product.isRated) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="flex items-center gap-2 text-[var(--red-brand)] cursor-pointer hover:underline mt-2">
            <Ticket className="text-[var(--red-brand)]" />
            Sản phẩm này đã nhận đánh giá
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <DialogTitle className="text-xl font-semibold mb-2">
              Bạn đã đánh giá đơn này rồi. Cảm ơn bạn đã đánh giá sản phẩm của
              chúng tôi!
            </DialogTitle>
            <DialogDescription>
              Đánh giá sản phẩm của bạn giúp chúng tôi cải thiện chất lượng dịch
              vụ và sản phẩm.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 text-[var(--red-brand)] mt-2 hover:underline cursor-pointer">
          <Ticket className="text-[var(--red-brand)]" />
          Sản phẩm đang chờ đánh giá
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Đánh giá sản phẩm</DialogTitle>
          <DialogDescription>
            Trải nghiệm của bạn với sản phẩm này thế nào ?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
            <img
              src={
                product.seo?.thumbnail ||
                product.images?.[0]?.urls?.[0] ||
                "/placeholder.svg"
              }
              alt={product.name}
              className="h-16 w-16 rounded-md object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(product.finalPrice)}
              </p>
              {/* <div className="flex items-center gap-2 mt-1">
                <Package className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                                  Ordered on
                                  {product.orderDate}
                </span>
              </div> */}
            </div>
          </div>

          {/* Rating Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Đánh giá chung</Label>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={() => handleStarLeave}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground hover:text-yellow-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                {rating > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {getRatingText(rating)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Review Section */}
          <div className="space-y-3">
            <Label htmlFor="review" className="text-base font-medium">
              Viết đánh giá của bạn về sản phẩm này{" "}
              <span className="text-sm text-muted-foreground font-normal">
                (Tuỳ chọn)
              </span>
            </Label>
            <Textarea
              id="review"
              placeholder="Chia sẻ ý kiến của bạn về sản phẩm này của bạn"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="text-right">
              <span className="text-xs text-muted-foreground">
                {review.length}/500 characters
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Add Photos</Label>

            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm">
                  <span className="font-medium text-primary">Nhấn vào đây</span>
                  <span className="text-muted-foreground">
                    {" "}
                    hoặc kéo thả hình ảnh
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 10MB (tối đa 3 ảnh)
                </p>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Review image ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Để sau
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isUploading}
            className="min-w-[100px]"
          >
            Đánh giá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
