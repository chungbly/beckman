import { getPosts } from "@/client/post.client";
import { getProducts } from "@/client/product.client";
import { getGlobalConfig } from "@/lib/configs";
import { getUserId } from "@/lib/cookies";
import { isMobileServer } from "@/lib/isMobileServer";
import { HightlightCategoryLayout } from "@/types/admin-layout";
import dynamic from "next/dynamic";
const DesktopHighlightCategoryItem = dynamic(
  () => import("./desktop-highlight-category-item")
);
const MobileHighlightCategoryItem = dynamic(
  () => import("./mobile-highlight-category-item")
);

const isNumber = (value: number | undefined): value is number =>
  typeof value === "number";

async function getProductsByIds(ids: number[], userId: string) {
  if (!ids.length) return [];
  const res = await getProducts({
    ids,
    status: true,
    userId,
  });
  const products = res?.data || [];
  return products;
}

async function getPostsByIds(ids: string[]) {
  if (!ids.length) return [];
  const res = await getPosts({
    ids,
    isShow: true,
  });
  const posts = res?.data || [];
  return posts;
}

async function HighlightCategories() {
  const configs = await getGlobalConfig();
  const userId = await getUserId();
  const isMobile = await isMobileServer();

  const highlightCategories = (configs["CATEGORY_HIGHLIGHTS"] ||
    []) as HightlightCategoryLayout[];
  const height = configs["CATEGORY_HIGHLIGHTS_PRODUCT_HEIGHT"] as number;
  if (!highlightCategories.length) return null;
  const productIds = highlightCategories.reduce(
    (cur, category: HightlightCategoryLayout) => {
      if (!category.items.length) return cur;
      const ids = category.items
        .map((item) => {
          if (item.type === "Product") return item.productId;
          if (item.type === "Scrollable") return item.productIds;
        })
        .flat()
        .filter(isNumber);
      return [...cur, ...ids];
    },
    [] as number[]
  );
  const postIds = highlightCategories.flatMap((c) =>
    c.items.flatMap((i) => i.magazineIds || [])
  );
  const [products, posts] = await Promise.all([
    getProductsByIds(productIds, userId),
    getPostsByIds(postIds),
  ]);
  return highlightCategories.map((category) => {
    if (isMobile) {
      return (
        <MobileHighlightCategoryItem
          category={category}
          key={category.id}
          products={products}
          posts={posts}
          height={height}
        />
      );
    }
    return (
      <DesktopHighlightCategoryItem
        category={category}
        key={category.id}
        products={products}
        posts={posts}
        height={height}
      />
    );
  });
}

export default HighlightCategories;
