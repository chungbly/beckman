import { getCategories } from "@/client/category.client";
import { getPosts } from "@/client/post.client";
import { getProducts } from "@/client/product.client";
import type { MetadataRoute } from "next";

const fetchCategories = async () => {
  const res = await getCategories({});
  return res.data || [];
};

const fetchProducts = async () => {
  const products = [];
  const res = await getProducts(
    {
      status: true,
    },
    100,
    1,
    true
  );
  const data = res.data;
  products.push(...(data?.items || []));
  const totalPage = data?.meta.pageCount || 1;
  for (let i = 2; i <= totalPage; i++) {
    const res = await getProducts(
      {
        status: true,
      },
      100,
      i
    );
    products.push(...(res.data || []));
  }
  return products;
};

const fetchPosts = async () => {
  const posts = [];
  const res = await getPosts(
    {
      isShow: true,
    },
    100,
    1,
    true
  );
  const data = res.data;
  posts.push(...(data?.items || []));
  const totalPage = data?.meta.pageCount || 1;
  for (let i = 2; i <= totalPage; i++) {
    const res = await getPosts(
      {
        isShow: true,
      },
      100,
      i
    );
    posts.push(...(res.data || []));
  }
  return posts;
};
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
  const categoryUrls = categories.map((category) => ({
    url: `https://beckman.vn/danh-muc/${category.seo.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as ChangeFrequency,
    priority: 1,
  }));
  const productUrls = products.map((product) => ({
    url: `https://beckman.vn/${product.seo.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as ChangeFrequency,
    priority: 1,
  }));
  const postUrls = posts.map((post) => {
    return {
      url: `https://beckman.vn/${post.isMagazine ? "magazine" : "gioi-thieu"}/${
        post.seo.slug
      }`,
      lastModified: new Date(),
      changeFrequency: "daily" as ChangeFrequency,
      priority: 1,
    };
  });
  const urls = [...categoryUrls, ...productUrls, ...postUrls];
  return urls;
}
