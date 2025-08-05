"use client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Post as TPost } from "@/types/post";
import Autoplay from "embla-carousel-autoplay";
import { CalendarIcon, ClockIcon } from "lucide-react";
import moment from "moment-timezone";
import Image from "next/image";
import Link from "next/link";
import MagazineCategoryFilter from "./categories-filter";

function Post({
  post,
  size = "large",
  prefix = "/magazine",
}: {
  post: TPost;
  size?: "large" | "small";
  prefix?: string;
}) {
  if (size === "small") {
    return (
      <div className="flex space-x-4">
        <div className="w-[150px] h-[100px] relative flex-shrink-0">
          {post.seo?.thumbnail && (
            <Image
              src={post.seo.thumbnail}
              alt={post.title}
              fill
              priority
              sizes="150px"
              className="object-cover rounded-sm"
            />
          )}
        </div>
        <div>
          <h3 className="font-medium line-clamp-2">
            <Link
              href={`${prefix}/${post.seo.slug}`}
              className="hover:underline"
            >
              {post.title}
            </Link>
          </h3>
          {post.createdAt && (
            <p className="text-sm text-muted-foreground">
              {moment
                .tz(post.createdAt, "Asia/Ho_Chi_Minh")
                .format("D [tháng] M, YYYY")}
            </p>
          )}
        </div>
      </div>
    );
  }
  return (
    <Card className="overflow-hidden">
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
      <CardContent className="p-4">
        {!!post.tags?.length && (
          <MagazineCategoryFilter categories={post.tags} />
        )}
        <CardTitle className="text-lg mb-2">
          <Link href={`${prefix}/${post.seo.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground mb-4">
          {post.subDescription}
        </p>
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarIcon className="mr-1 h-3 w-3" />
          {post.createdAt && (
            <p className="text-sm text-muted-foreground">
              {moment
                .tz(post.createdAt, "Asia/Ho_Chi_Minh")
                .format("D [tháng] M, YYYY")}
            </p>
          )}
          <Separator orientation="vertical" className="mx-2 h-3" />
          <ClockIcon className="mr-1 h-3 w-3" />
          {/* <span>{post.readTime}</span> */}
        </div>
      </CardContent>
    </Card>
  );
}

export default Post;
