"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Post } from "@/types/post";
import Autoplay from "embla-carousel-autoplay";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ClockIcon,
  ImageOff,
} from "lucide-react";
import moment from "moment-timezone";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function MagazineSlide({ posts }: { posts: Post[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

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
    <>
      {!!posts?.length && (
        <Carousel
          plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
          setApi={setApi}
        >
          <CarouselContent>
            {posts?.map((post) => (
              <CarouselItem key={post._id}>
                <Card className="aspect-square sm:aspect-video rounded-lg relative">
                  {post.seo.thumbnail ? (
                    <Image
                      src={post.seo.thumbnail || ""}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <ImageOff />
                  )}
                  <CardContent className="p-6 absolute bottom-0 w-full rounded-lg bg-gradient-to-b from-black/0 to-black/90">
                    {post.tags?.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="mr-2 mb-2"
                      >
                        {tag}
                      </Badge>
                    ))}
                    <CardTitle className="text-xl sm:text-2xl mb-2 text-white">
                      <Link
                        href={`/magazine/${post.seo.slug}`}
                        className="hover:underline "
                      >
                        {post.title}
                      </Link>
                    </CardTitle>
                    <p className="text-white mb-4 line-clamp-3 sm:line-clamp-none max-sm:text-sm">
                      {post.subDescription}
                    </p>
                    <div className="flex items-center text-sm text-white">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      {post.createdAt && (
                        <p className="text-sm text-muted-foreground">
                          {moment
                            .tz(post.createdAt, "Asia/Ho_Chi_Minh")
                            .format("D [tháng] M, YYYY")}
                        </p>
                      )}
                      <Separator orientation="vertical" className="mx-2 h-4" />
                      <ClockIcon className="mr-1 h-4 w-4" />
                      {/* <span>{post.readTime}</span> */}
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div
            className={cn(
              "absolute right-4 flex gap-2 bottom-4  bg-black/50 text-white px-3 py-1 rounded-full text-sm "
            )}
          >
            <ChevronLeft
              className="h-5 w-5 cursor-pointer"
              onClick={() => api?.scrollPrev()}
            />
            {current}/{posts.length}
            <ChevronRight
              className="h-5 w-5 cursor-pointer"
              onClick={() => api?.scrollNext()}
            />
          </div>
        </Carousel>
      )}
    </>
  );
}

export default MagazineSlide;
