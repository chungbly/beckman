"use client";
import RenderHTMLFromCMS from "@/components/app-layout/render-html-from-cms";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Post } from "@/types/post";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function BigPost({ post }: { post: Post }) {
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (!ref.current) return;
    const onChange = () => {
      setHeight(ref.current?.offsetHeight);
    };
    window.addEventListener("resize", onChange);
    onChange();

    const scrollEl = document.querySelector(".scrollable");
    const fadeEl = document.querySelector(".fade-top");
    if (!scrollEl || !fadeEl) return;

    scrollEl.addEventListener("scroll", () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      (fadeEl as HTMLDivElement).style.opacity = isAtBottom ? "0" : "1";
    });
    return () => {
      window.removeEventListener("resize", onChange);
    };
  }, []);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 sm:gap-8">
      {/* About Section */}
      <ScrollArea
        viewportClassName="scrollable"
        className="max-sm:order-2 col-span-1 bg-[var(--rose-beige)] border-none shadow-lg p-4 relative max-h-[900px] "
        style={{
          ...(isMobile
            ? {
                maxHeight: "500px",
                height: "500px",
              }
            : height
            ? { maxHeight: height, height }
            : {}),
        }}
      >
        <RenderHTMLFromCMS html={post.content} />
        <div className="fade-top absolute bottom-0 left-0 right-0 pointer-events-none h-1/2 bg-gradient-to-b from-white/0 to-white/100" />
      </ScrollArea>

      {/* Mission Section - Image */}
      <div className="max-sm:order-1 col-span-1 lg:col-span-2  h-full w-full  max-sm:mb-4">
        <Carousel
          plugins={[
            Autoplay({
              delay: 2000,
            }),
          ]}
        >
          <CarouselContent ref={ref} className=" ml-0">
            {post.images?.length &&
              post.images.map((image, index) => (
                <CarouselItem className="relative aspect-square" key={index}>
                  <Image
                    src={image}
                    alt={post.title}
                    fill
                    sizes="800px"
                    priority={index === 0}
                    className="object-cover rounded-lg"
                  />
                </CarouselItem>
              ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}

export default BigPost;
