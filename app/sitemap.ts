import { getCategories } from "@/client/category.client";
import { getPosts } from "@/client/post.client";
import { getProducts } from "@/client/product.client";
import type { MetadataRoute } from "next";
import { cache } from "react";

// Cache sitemap trong 1 ngày (86400 giây)
// Override force-dynamic từ root layout để cho phép cache
export const dynamic = "force-static";
export const revalidate = 86400;

// Wrap các fetch functions với React cache để cache trong request
const fetchCategories = cache(async () => {
  const res = await getCategories({});
  return res.data || [];
});

const fetchProducts = cache(async () => {
  // Fetch page đầu tiên để lấy totalPage
  const firstPageRes = await getProducts(
    {
      status: true,
    },
    100,
    1,
    true
  );
  const firstPageData = firstPageRes.data;
  const products = [...(firstPageData?.items || [])];
  const totalPage = firstPageData?.meta.pageCount || 1;

  // Nếu có nhiều hơn 1 page, fetch tất cả các pages còn lại song song
  if (totalPage > 1) {
    const remainingPages = Array.from(
      { length: totalPage - 1 },
      (_, i) => i + 2
    );
    const pagePromises = remainingPages.map((page) =>
      getProducts(
        {
          status: true,
        },
        100,
        page
      )
    );
    const pageResults = await Promise.all(pagePromises);
    pageResults.forEach((res) => {
      if (res.data) {
        // Khi getTotal = false, res.data là Product[] trực tiếp
        const items = Array.isArray(res.data)
          ? res.data
          : (res.data as any).items || [];
        products.push(...items);
      }
    });
  }

  return products;
});

const fetchPosts = cache(async () => {
  // Fetch page đầu tiên để lấy totalPage
  const firstPageRes = await getPosts(
    {
      isShow: true,
    },
    100,
    1,
    true
  );
  const firstPageData = firstPageRes.data;
  const posts = [...(firstPageData?.items || [])];
  const totalPage = firstPageData?.meta.pageCount || 1;

  // Nếu có nhiều hơn 1 page, fetch tất cả các pages còn lại song song
  if (totalPage > 1) {
    const remainingPages = Array.from(
      { length: totalPage - 1 },
      (_, i) => i + 2
    );
    const pagePromises = remainingPages.map((page) =>
      getPosts(
        {
          isShow: true,
        },
        100,
        page
      )
    );
    const pageResults = await Promise.all(pagePromises);
    pageResults.forEach((res) => {
      if (res.data) {
        // Khi getTotal = false, res.data là Post[] trực tiếp
        const items = Array.isArray(res.data)
          ? res.data
          : (res.data as any).items || [];
        posts.push(...items);
      }
    });
  }

  return posts;
});
type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never"
  | undefined;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, posts] = await Promise.all([
    fetchCategories(),
    fetchProducts(),
    fetchPosts(),
  ]);
  const categoryUrls = categories
    .filter((category) => category?.seo?.slug)
    .map((category) => ({
      url: `https://beckman.vn/danh-muc/${category.seo.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as ChangeFrequency,
      priority: 1,
    }));
  const productUrls = products
    .filter((product) => product?.seo?.slug)
    .map((product) => ({
      url: `https://beckman.vn/${product.seo.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as ChangeFrequency,
      priority: 1,
    }));
  const postUrls = posts
    .filter((post) => post?.seo?.slug)
    .map((post) => {
      return {
        url: `https://beckman.vn/magazine/${post.seo.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as ChangeFrequency,
        priority: 1,
      };
    });
  const urls = [...categoryUrls, ...productUrls, ...postUrls];
  return urls;
}
