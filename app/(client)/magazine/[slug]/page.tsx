import {
  getSameAuthorPosts as fetchSameAuthorPosts,
  getPosts,
} from "@/client/post.client";
import RenderHTMLFromCMS from "@/components/app-layout/render-html-from-cms";
import MagazineCategoryFilter from "@/components/pages/client/magazine/categories-filter";
import LoadMoreSimilarPosts from "@/components/pages/client/magazine/load-more-similar-post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSimilarPostsInfinityQuery } from "@/query/post.query";
import { QueryClient } from "@tanstack/react-query";
import {
  CalendarIcon,
  CircleChevronLeft,
  CircleChevronRight,
  ClockIcon,
} from "lucide-react";
import moment from "moment-timezone";
import { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

const getPost = async (slug: string) => {
  const res = await getPosts(
    {
      slug,
      isShow: true,
    },
    1,
    1
  );
  if (!res || !res.data?.length) {
    return null;
  }
  const post = res.data[0];
  return post;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = (await params).slug;

  const post = await getPost(slug);
  const previousImages = (await parent).openGraph?.images || [];

  if (post) {
    return {
      openGraph: {
        images: post?.seo?.thumbnail || post.images?.[0] || previousImages,
      },
      title: post.title,
      description: post?.seo?.description || "Beckman - Be a Classic Gentleman",
      keywords: post?.seo?.keywords || "Beckman, giay, dep",
    };
  }
  return {
    openGraph: {
      images: [...previousImages],
    },
    description: "Beckman - Be a Classic Gentleman",
    title: "Beckman - Be a Classic Gentleman",
    keywords: "Beckman, giay, dep, giam them, discount",
  };
}

const getSameAuthorPosts = async (slug: string) => {
  const res = await fetchSameAuthorPosts(
    {
      slug,
      isShow: true,
      getRandom: true,
    },
    2,
    1
  );
  if (!res || !res.data?.length) {
    return null;
  }
  const post = res.data;
  return post;
};

export default async function BlogPostPage({ params }: Props) {
  const slug = (await params).slug;
  const queryClient = new QueryClient();
  const [post, sameAuthorPosts] = await Promise.all([
    getPost(slug),
    getSameAuthorPosts(slug),
    queryClient.prefetchInfiniteQuery(getSimilarPostsInfinityQuery(slug)),
  ]);
  if (!post) notFound();
  return (
    <div className="container mx-auto grid sm:grid-cols-3 gap-[20px]">
      <div className=" space-y-8 col-span-2">
        <div className=" space-y-8">
          {/* Post Header */}
          <div>
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="mr-2 mb-2">
                {tag}
              </Badge>
            ))}
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center text-sm text-muted-foreground mb-4">
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
          </div>

          {/* Featured Image */}
          {post.seo?.thumbnail && (
            <div className="aspect-video relative rounded-lg overflow-hidden">
              <Image
                src={post.seo?.thumbnail}
                alt={post.title}
                fill
                quality={100}
                priority
                sizes="800px"
                className="object-cover"
              />
            </div>
          )}

          {/* Post Content */}
          <RenderHTMLFromCMS html={post.content} />

          {/* Author Info */}
          {post.author && (
            <Card>
              <CardContent className="flex items-center space-x-4 p-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={post.author.photo}
                    alt={post.author.fullName}
                  />
                  <AvatarFallback>
                    {post.author.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{post.author.fullName}</h3>
                  {post.author.quote && (
                    <i className="text-sm text-muted-foreground">
                      &quot;{post.author.quote}&quot;
                    </i>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {sameAuthorPosts && sameAuthorPosts.length > 1 && (
            <div className="flex items-center justify-between">
              <Link
                href={sameAuthorPosts[0].seo.slug || "#"}
                className="max-sm:text-sm max-w-[180px] sm:max-w-[300px] hover:underline flex items-center gap-2"
              >
                <CircleChevronLeft className="min-w-fit" />
                {sameAuthorPosts[0].title}
              </Link>
              <Link
                href={sameAuthorPosts[1].seo.slug || "#"}
                className="max-sm:text-sm max-w-[180px] sm:max-w-[300px] hover:underline flex items-center gap-2"
              >
                {sameAuthorPosts[1].title}
                <CircleChevronRight className="min-w-fit" />
              </Link>
            </div>
          )}

          {/* Social Share */}
          {/* <div>
          <h3 className="font-semibold mb-2">Chia sẻ bài viết</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon">
              <FacebookIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <TwitterIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <LinkedinIcon className="h-4 w-4" />
            </Button>
          </div>
        </div> */}
        </div>
        <h2 className="text-2xl">Bài viết liên quan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LoadMoreSimilarPosts />
        </div>
      </div>

      <div className="space-y-8 hidden sm:block ">
        {/* Categories */}
        <div className="p-[20px] border-l border-[var(--brown-brand)] sticky top-24">
          <h2 className="font-bold text-[40px] mb-[20px] underline">
            Danh mục
          </h2>
          <MagazineCategoryFilter />
        </div>
      </div>
    </div>
  );
}
