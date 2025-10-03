"use client";

import { Frame } from "@/app/(admin)/admin/ui/frames/page";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useConfigs } from "@/store/useConfig";
import { Product } from "@/types/product";
import {
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  PlayCircle,
} from "lucide-react";
import Image from "next/image";
import { forwardRef, useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

interface ProductGalleryProps {
  product: Product;
  className?: string;
}

const videoExtensions = ["mp4", "wmv", "mkv", "flv", "mpeg"];

function ProductGallery({ product, className }: ProductGalleryProps) {
  const isMobile = useIsMobile();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [video, setVideo] = useState<string | null>(null); // State to track video play/pause in mobile view

  const configs = useConfigs((s) => s.configs);
  const FRAMES = (configs?.["FRAMES"] as Frame[]) || [];

  const frameByCategory = FRAMES.filter(
    (f) =>
      f.type === "Category" &&
      f.selectedCategory.some((c) =>
        product.categories.some((cate) => cate._id === c.value)
      )
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
  const hasVideo = images.some((image) =>
    videoExtensions.some((v) => image.includes(v))
  );

  const firstVideoIndex = images.findIndex((image) =>
    videoExtensions.some((v) => image.includes(v))
  );

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  return (
    <div className={cn("max-h-full", className)}>
      {isMobile ? (
        <Carousel setApi={setApi} className="aspect-square sm:mt-7">
          <CarouselContent className="ml-0">
            {images.map((image, index) => {
              const isVideo = !!videoExtensions.find((v) => image.includes(v));
              return (
                <CarouselItem
                  className="relative pl-0 aspect-square   overflow-hidden"
                  key={index}
                  onClick={() => {
                    if (!isVideo) return;
                    if (!isMobile) {
                      const video = document.querySelector(
                        `#video-${index}`
                      ) as HTMLVideoElement; // Type assertion to HTMLVideoElement
                      if (!video) return;
                      video.muted = !video.muted;
                      return;
                    }
                    setVideo(image);
                  }}
                >
                  {isVideo ? (
                    <video
                      id={`video-${index}`}
                      muted
                      autoPlay
                      loop
                      className="w-full h-full object-cover"
                    >
                      <source src={image} />
                    </video>
                  ) : (
                    <>
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="400px"
                        className="object-cover"
                        priority={index === 1}
                      />
                      {frameUrl && (
                        <div className="absolute top-0 right-0 left-0 bottom-0">
                          <Image
                            src={frameUrl}
                            sizes="300px"
                            alt="Frame"
                            fill
                          />
                        </div>
                      )}
                    </>
                  )}
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div
            className={cn(
              "absolute flex gap-2 bottom-4  bg-black/50 text-white px-3 py-1 rounded-full text-sm",
              hasVideo ? "left-4" : "right-4"
            )}
          >
            <ChevronLeft
              className="h-5 w-5 cursor-pointer"
              onClick={() => api?.scrollPrev()}
            />
            {current}/{images.length}
            <ChevronRight
              className="h-5 w-5 cursor-pointer"
              onClick={() => api?.scrollNext()}
            />
          </div>
          {hasVideo && firstVideoIndex !== -1 && (
            <div
              onClick={() => {
                api?.scrollTo(firstVideoIndex);
                setVideo(images[firstVideoIndex]);
              }}
              className="absolute flex gap-2 bottom-4 right-4  bg-black/50 text-white px-3 py-1 rounded-full text-sm"
            >
              <CirclePlay />
            </div>
          )}
        </Carousel>
      ) : (
        <ScrollArea>
          <div
            className={cn(
              "flex flex-wrap gap-[10px]",
              "h-full max-h-[1400px] ",
              "max-sm:!min-h-[647px]",
              !!product.recommendedProducts?.length
                ? "md:h-[1400px]"
                : "md:h-[1000px]"
            )}
          >
            {images.map((image, index) => {
              const isVideo = !!videoExtensions.find((v) => image.includes(v));
              return (
                <button
                  key={index}
                  className={cn(
                    "relative aspect-square flex-shrink-0 overflow-hidden h-fit transition-all duration-300",
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
                      src={
                        image?.startsWith("http")
                          ? image
                          : `https://beckman.vn/${image}`
                      }
                      alt={`${product.name}`}
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
      )}

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
