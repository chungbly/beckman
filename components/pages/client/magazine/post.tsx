"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Post as TPost } from "@/types/post";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";

function Post({
  post,
  size = "large",
  prefix = "/magazine",
  className,
}: {
  post: TPost;
  size?: "large" | "small";
  prefix?: string;
  className?: string;
}) {
  if (size === "small") {
    return (
      <div className={cn("space-y-4 hover:shadow-lg hover:bg-white/10 p-1", className)}>
        <h3 className="font-bold text-xl line-clamp-2">
          <Link href={`${prefix}/${post.seo.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h3>
        <p className="text-black line-clamp-[8]">{post.subDescription}</p>
        <div className="aspect-video relative">
          {!!post.images?.length && post.images.length > 1 ? (
            <Carousel
              plugins={[
                Autoplay({
                  delay: 2000,
                }),
              ]}
            >
              <CarouselContent className=" ml-0">
                {post.images.map((image, index) => (
                  <CarouselItem className="relative aspect-video" key={index}>
                    <Image
                      src={image}
                      alt={post.title}
                      fill
                      sizes={"500px"}
                      priority={index === 0}
                      className="object-cover rounded-lg"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            (post.seo?.thumbnail || post.images?.[0]) && (
              <Image
                src={post.seo.thumbnail || post.images?.[0]}
                alt={post.title}
                fill
                priority
                sizes="500px"
                className="object-cover"
              />
            )
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-3">
      <div className="aspect-video relative sm:col-span-2">
        {!!post.images?.length && post.images.length > 1 ? (
          <Carousel
            plugins={[
              Autoplay({
                delay: 2000,
              }),
            ]}
          >
            <CarouselContent className=" ml-0">
              {post.images.map((image, index) => (
                <CarouselItem className="relative aspect-video" key={index}>
                  <Image
                    src={image}
                    alt={post.title}
                    fill
                    sizes={"500px"}
                    priority={index === 0}
                    className="object-cover rounded-lg"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          (post.seo?.thumbnail || post.images?.[0]) && (
            <Image
              src={post.seo.thumbnail || post.images?.[0]}
              alt={post.title}
              fill
              priority
              sizes="500px"
              className="object-cover"
            />
          )
        )}
      </div>
      <div className="sm:p-4 sm:py-1 sm:col-span-1">
        <h3 className="font-bold text-6xl ">
          <Link href={`${prefix}/${post.seo.slug}`} className="hover:underline line-clamp-3 leading-[77px]">
            {post.title}
          </Link>
        </h3>
        <p className="text-black mt-2">{post.subDescription}</p>
      </div>
    </div>
  );
}

export default Post;
