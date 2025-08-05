"use client";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useConfigs } from "@/store/useConfig";
import { CarouselSlide } from "@/types/carousel";
import { shimmer, toBase64 } from "@/utils";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function HomePageCarousel({
  slides,
  isMobile,
}: {
  isMobile: boolean;
  slides: CarouselSlide[];
}) {
  const configs = useConfigs((s) => s.configs);
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const delayTime = (configs["DELAY_TIME"] as number) || 15000;

  useEffect(() => {
    if (!api) {
      return;
    }
    api.on("autoplay:select", () => {
      setCurrent(api.selectedScrollSnap() || 0);
    });
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() || 0);
    });
  });
  return (
    <Carousel
      setApi={setApi}
      plugins={[
        Autoplay({
          delay: delayTime,
        }),
      ]}
      opts={{
        align: "start",
        loop: true,
      }}
      className="relative w-full"
    >
      <CarouselContent>
        {slides.map((slide, index) => (
          <CarouselItem key={index}>
            <div
              onClick={() => {
                if (!slide.href) {
                  return;
                }
                if (slide.newTab) {
                  window.open(slide.href, "_blank");
                  return;
                }
                router.push(slide.href);
              }}
              className={cn(
                "relative grid grid-cols-2 w-full aspect-[0.65] sm:aspect-auto h-auto sm:h-[800px]",
                slide.href ? "cursor-pointer" : "cursor-default"
              )}
            >
              {slide.mobileImage && isMobile && (
                <Image
                  src={slide.mobileImage}
                  alt={`Home page Carousel slide ${index}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  loading={index === 0 ? "eager" : "lazy"}
                  priority={index === 0}
                  className="object-cover block sm:hidden"
                  placeholder={`data:image/svg+xml;base64,${toBase64(
                    shimmer(600, 300)
                  )}`}
                />
              )}
              {slide.image && !isMobile && (
                <Image
                  src={slide.image}
                  alt={`Home page Carousel slide ${index}`}
                  fill
                  quality={100}
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-cover hidden sm:block"
                  priority={index === 0}
                  unoptimized
                  fetchPriority="high"
                />
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="absolute bottom-10 left-[50%] -translate-x-1/2 py-2 text-center text-sm text-muted-foreground">
        {Array.from({ length: slides.length }).map((_, index) => (
          <span
            onClick={() => api?.scrollTo(index)}
            key={index}
            className={cn(
              `inline-block w-2 h-2 rounded-full bg-white/20  cursor-pointer mx-1`,
              index === current ? "bg-white" : "bg-white/20"
            )}
          />
        ))}
      </div>
      <CarouselPrevious className="absolute hidden sm:flex left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 border-none" />
      <CarouselNext className="absolute hidden sm:flex right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 border-none" />
    </Carousel>
  );
}

export default HomePageCarousel;
