import { APIStatus } from "@/client/callAPI";
import { getPosts } from "@/client/post.client";
import RenderHTMLFromCMS from "@/components/app-layout/render-html-from-cms";
import { Breadcrumb } from "@/components/product/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import moment from "moment-timezone";


type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await props.params;
  const res = await getPosts(
    {
      slug,
      isShow: true,
      isMagazine: false,
    },
    1,
    1
  );
  const post = res.data?.[0];
  const previousImages = (await parent).openGraph?.images || [];

  if (post) {
    return {
      openGraph: {
        images: post?.seo?.thumbnail || post.images?.[0] || previousImages,
      },
      title: post.title,
      description: post?.seo?.description || "R8ckie - Step on your way",
      keywords: post?.seo?.keywords || "R8ckie, giay, dep",
    };
  }
  return {
    openGraph: {
      images: [...previousImages],
    },
    description: "R8ckie - Step on your way",
    title: "R8ckie - Step on your way",
    keywords: "R8ckie, giay, dep, giam them, discount",
  };
}

async function AboutDetail(props: Props) {
  const { slug } = await props.params;
  const res = await getPosts(
    {
      slug,
      isShow: true,
      isMagazine: false,
    },
    1,
    1
  );
  if (!res || !res?.data?.length || res.status !== APIStatus.OK) {
    return notFound();
  }
  const post = res.data[0];
  return (
    <div className="container pt-4">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "About", href: "/about" },
          { label: post.title },
        ]}
        className="hidden sm:flex text-[var(--brown-brand)]"
      />
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
              className="object-cover"
            />
          </div>
        )}

        {/* Post Content */}
        <RenderHTMLFromCMS html={post.content} />

        {/* Author Info */}
      </div>
    </div>
  );
}

export default AboutDetail;
