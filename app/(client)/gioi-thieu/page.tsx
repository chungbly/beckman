import { getPosts } from "@/client/post.client";
import BigPost from "@/components/pages/client/gioi-thieu/big-post";
import Post from "@/components/pages/client/magazine/post";
import { notFound } from "next/navigation";

export default async function AboutPage() {
  const res = await getPosts(
    {
      isMagazine: false,
      isShow: true,
    },
    100,
    1
  );
  if (!res || !res?.data?.length || res.status !== "OK") return notFound();
  const posts = res.data || [];
  const bigPosts = posts.filter((post) => post.isOutStanding);
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        {bigPosts?.map((post) => (
          <BigPost key={post._id} post={post} />
        ))}

        {/* Culture Section */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-8 p-4 bg-[var(--rose-beige)]">
            Văn hoá R8ckie
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts
              ?.filter((i) => !i.isOutStanding)
              ?.map((post) => {
                return <Post prefix="/gioi-thieu" key={post._id} post={post} />;
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
