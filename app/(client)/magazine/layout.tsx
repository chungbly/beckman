import { getPosts } from "@/client/post.client";
import MagazineCategoryFilter from "@/components/pages/client/magazine/categories-filter";
import Post from "@/components/pages/client/magazine/post";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGlobalConfig } from "@/lib/configs";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "R8ckie Magazine",
  description: "R8ckie - Magazine",
  keywords:
    "R8ckie, giay, dep, giam them, discount, magazine, tap-chi, huong-dan",
};

const getFeaturedPost = async () => {
  const res = await getPosts(
    {
      isOutStanding: true,
      isShow: true,
      isMagazine: true,
    },
    12,
    1
  );
  if (!res || !res.data?.length) {
    return null;
  }
  return res.data;
};

const getMostViewedPost = async () => {
  const res = await getPosts(
    {
      isShow: true,
      sort: {
        view: -1,
      },
      isMagazine: true,
    },
    10,
    1
  );
  if (!res || !res.data?.length) {
    return null;
  }
  return res.data;
};

async function Layout({ children }: { children: React.ReactNode }) {
  const configs = await getGlobalConfig();
  const MAGAZINE_CATEGORIES =
    (configs?.["MAGAZINE_CATEGORIES"] as string[]) || [];
  const [featuredPost, mostViewedPost] = await Promise.all([
    getFeaturedPost(),
    getMostViewedPost(),
  ]);
  return (
    <div className="container px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">{children}</div>

        {/* Sidebar */}
        <div className="space-y-8 hidden sm:block">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Tag bài viết</CardTitle>
            </CardHeader>
            <CardContent>
              <MagazineCategoryFilter categories={MAGAZINE_CATEGORIES} />
            </CardContent>
          </Card>
          {/* Tags */}
          {/* Featured Posts */}
          <Card>
            <CardHeader className="sm:p-6 p-4">
              <CardTitle>Bài viết nổi bật</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:p-6 p-4">
              {!!featuredPost?.length &&
                featuredPost.map((post) => (
                  <Post post={post} key={post._id} size="small" />
                ))}
            </CardContent>
          </Card>

          {/* Popular Posts */}
          <Card>
            <CardHeader className="sm:p-6 p-4">
              <CardTitle>Bài viết phổ biến</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:p-6 p-4">
              {!!mostViewedPost?.length &&
                mostViewedPost.map((post) => (
                  <Post post={post} key={post._id} size="small" />
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Layout;
