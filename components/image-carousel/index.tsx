"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";

function ImageCarousel({
  images = [],
  sizes = "(max-width: 640px) 300px, 500px",
  className,
}: {
  sizes?: string;
  images: string[];
  className?: string;
  }) {
  const firstImage = images[0];
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "relative w-12 h-12 max-w-12 max-h-12 flex items-center justify-center cursor-pointer",
          className
        )}
        onClick={() => {
          // if (images.length < 2) return;
          setOpen(true);
        }}
      >
        {firstImage ? (
          <Image
            src={firstImage}
            alt="product image"
            sizes={sizes}
            fill
            className="rounded-sm"
          />
        ) : (
          <ImageOff className="w-10 h-10 text-gray-300" />
        )}
      </div>
      <Dialog open={open} onOpenChange={() => setOpen(false)}>
        <DialogTitle className="invisible hidden">Product Images</DialogTitle>
        <DialogContent className="p-8">
          <Carousel className="max-w-[450px]">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <Image
                    src={image}
                    alt="product image"
                    width={450}
                    height={450}
                    sizes="(max-width: 640px) 300px, 500px"
                    className="rounded-sm"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ImageCarousel;
