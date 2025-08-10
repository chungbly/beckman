"use client";

import { Frame } from "@/app/(admin)/admin/ui/frames/page";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useConfigs } from "@/store/useConfig";
import { Product } from "@/types/product";
import { PlayCircle } from "lucide-react";
import Image from "next/image";
import { forwardRef, Ref, useState } from "react";
import { ProductDetailFormValue } from "../pages/client/product/mobile-footer-actionbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

interface ProductGalleryProps {
  product: Product;
  className?: string;
  form: ProductDetailFormValue;
  style?: React.CSSProperties;
}

const videoExtensions = ["mp4", "wmv", "mkv", "flv", "mpeg"];

function ProductGallery(
  { product, className, form, style }: ProductGalleryProps,
  ref: Ref<HTMLDivElement>
) {
  const isMobile = useIsMobile();
  const [video, setVideo] = useState<string | null>(null); // State to track video play/pause in mobile view

  const configs = useConfigs((s) => s.configs);
  const FRAMES = (configs?.["FRAMES"] as Frame[]) || [];

  const frameByCategory = FRAMES.filter(
    (f) =>
      f.type === "Category" &&
      f.selectedCategory.some((c) => product.categories.some(cate => cate._id ===c.value))
  );
  const frameByProduct = FRAMES.filter(
    (f) =>
      f.type === "Product" && f.selectedProducts.some((c) => product.kvId === c)
  );
  const frameByPrefix = FRAMES.filter(
    (f) =>
      f.type === "Prefix" &&
      f.prefixes.some((c) => product.kvCode.startsWith(c))
  );
  const frameUrl =
    frameByCategory.length > 0
      ? frameByCategory[0].image
      : frameByProduct.length > 0
      ? frameByProduct[0].image
      : frameByPrefix.length > 0
      ? frameByPrefix[0].image
      : "";

  const images = product?.images?.flatMap((image) => image.urls)?.length
    ? product?.images?.flatMap((image) => image.urls)
    : [product.seo?.thumbnail];

  return (
    <div className={cn("max-h-full", className)}>
      <ScrollArea>
        <div
          className={cn(
            "flex flex-wrap gap-[10px]",
            "h-full max-h-[1700px]",
            "max-sm:!min-h-[647px]"
          )}
        >
          {images.map((image, index) => {
            const isVideo = !!videoExtensions.find((v) => image.includes(v));
            return (
              <button
                key={index}
                className={cn(
                  "relative aspect-square flex-shrink-0 overflow-hidden transition-all duration-300",
                  index === 0 ? "w-full" : "w-[calc(50%-5px)]"
                )}
              >
                {isVideo ? (
                  <div className="absolute inset-0 ">
                    <video
                      autoPlay={false}
                      muted
                      className="w-full h-full object-cover "
                    >
                      <source src={image} />
                    </video>
                    <PlayCircle className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-black/50 text-white  p-1 rounded-full" />
                  </div>
                ) : (
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes={index === 0 ? "600px" : "400px"}
                    priority={index < 6}
                  />
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {isMobile && !!video && (
        <Dialog open={!!video && isMobile} onOpenChange={() => setVideo(null)}>
          <DialogHeader className="hidden">
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <DialogContent>
            <video
              autoPlay
              controls
              className="w-full h-full max-w-[800px] max-h-[800px] object-contain"
            >
              <source src={video} />
            </video>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default forwardRef(ProductGallery);
