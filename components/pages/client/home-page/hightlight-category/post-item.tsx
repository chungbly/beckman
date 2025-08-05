import { cn } from "@/lib/utils";
import { Post } from "@/types/post";
import Image from "next/image";
import Link from "next/link";

function PostItem({ post, className }: { className?: string; post: Post }) {
  return (
    <div className="flex gap-2 bg-[#D9D9D9] p-4 h-full">
      <div className={
        cn("w-[150px] min-w-[150px] sm:w-[240px] sm:min-w-[240px] h-[160px] relative",
          className
        )
      }>
        <Image
          src={post.seo?.thumbnail || post.images?.[0] || ""}
          alt={post.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Link href={`/magazine/${post.seo?.slug || "#"}`}>
          <h3 className="text-sm sm:text-xl sm:font-bold line-clamp-2 hover:underline">
            {post.title}
          </h3>
        </Link>
        <p className="text-sm sm:text-base line-clamp-4 text-muted-foreground">
          {post.subDescription}
        </p>
      </div>
    </div>
  );
}

export default PostItem;
