"use client";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useConfigs } from "@/store/useConfig";
import { Post } from "@/types/post";
import Autoplay from "embla-carousel-autoplay";
import React, { useEffect, useState } from "react";
import PostItem from "./post-item";

function PostsCarousel({
  posts,
  style = {},
}: {
  style?: React.CSSProperties;
  posts: Post[];
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const configs = useConfigs((s) => s.configs);
  const MAGAZINE_CAROUSEL_DELAY = (configs?.["MAGAZINE_CAROUSEL_DELAY"] ||
    3000) as number;

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
          delay: MAGAZINE_CAROUSEL_DELAY,
        }),
      ]}
      className="col-span-full max-sm:mb-5"
      style={style}
    >
      <CarouselContent>
        {posts.map((post) => (
          <CarouselItem key={post._id}>
            <PostItem post={post} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className=" py-2 text-center text-sm text-muted-foreground">
        {Array.from({ length: posts.length }).map((_, index) => (
          <span
            onClick={() => api?.scrollTo(index)}
            key={index}
            className={cn(
              `inline-block w-2 h-2 rounded-full bg-black/50  cursor-pointer mx-1`,
              index === current ? "bg-black" : "bg-black/50"
            )}
          />
        ))}
      </div>
    </Carousel>
  );
}

export default PostsCarousel;
