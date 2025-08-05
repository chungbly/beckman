"use client";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import { HightlightCategoryLayout } from "@/types/admin-layout";
import { Product } from "@/types/product";
import { motion } from "motion/react";
import { Racing_Sans_One } from "next/font/google";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useConfigs } from "@/store/useConfig";
import { Post } from "@/types/post";
import Link from "next/link";
import PostsCarousel from "./posts-carousel";

const racingsansone = Racing_Sans_One({
  subsets: ["latin"],
  weight: ["400"],
});

function MobileHighlightCategoryItem({
  category,
  products,
  posts,
  height,
}: {
  category: HightlightCategoryLayout;
  products: Product[];
  height: number;
  posts: Post[];
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const configs = useConfigs((s) => s.configs);
  const CATEGORY_HIGHLIGHTS_PRODUCT_MOBILE_HEIGHT = (configs?.[
    "CATEGORY_HIGHLIGHTS_PRODUCT_MOBILE_HEIGHT"
  ] || {}) as {
    [key: string]: {
      height: number;
    };
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      {
        threshold: 0.2,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const isMagainzeBlock = category.name?.toLowerCase() === "magazine";

  return (
    <div ref={ref} className="min-h-[10px]">
      <motion.div
        key={category.id}
        initial={{ opacity: 0, y: 50 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn("", isMagainzeBlock && "bg-[#EDEDED] pb-2")}
      >
        <div className={cn("container px-0 sm:px-2")}>
          <div className={cn("relative mt-12 px-2 sm:px-0")} ref={containerRef}>
            <h2
              className={cn(
                "text-[calc(2.25rem+2px)] font-semibold mb-4 text-[#4E2919] tracking-[0.15em]",
                racingsansone.className,
                isMagainzeBlock && "text-black"
              )}
            >
              {category.name}
            </h2>
            {!!category?.items?.length && (
              <div className="sm:hidden grid grid-cols-2 gap-3 ">
                {category?.items.map((item) => {
                  if (!item.isMobile) return null;
                  const style = {
                    height:
                      CATEGORY_HIGHLIGHTS_PRODUCT_MOBILE_HEIGHT?.[category.name]
                        ?.height ||
                      category.height ||
                      height ||
                      380,
                  };
                  if (item.type === "Banner" && item.image) {
                    return (
                      <Link
                        href={item.href || "#"}
                        key={item.id}
                        className="relative"
                        style={style}
                      >
                        <Image
                          fill
                          sizes="100%"
                          src={item.image}
                          alt={category.name}
                          className="object-cover"
                        />
                      </Link>
                    );
                  }
                  if (item.type === "Product") {
                    const product = products.find(
                      (product) => product.kvId === item.productId
                    );
                    if (!product) return null;
                    return (
                      <div key={item.id} className="w-full h-full">
                        <ProductCard
                          style={style}
                          product={{
                            ...product,
                            slug: item.href ? item.href : product.slug,
                          }}
                        />
                      </div>
                    );
                  }
                  if (item.type === "Scrollable") {
                    if (item.slideType === "Product") {
                      if (!item?.productIds?.length) return null;
                      const itemProducts = products.filter((product) =>
                        item.productIds!.includes(product.kvId)
                      );
                      return (
                        <div
                          key={item.id}
                          className="col-span-2 flex gap-4 overflow-x-auto scrollbar-hide pb-2"
                        >
                          {itemProducts.map((product) => (
                            <div
                              key={product._id}
                              style={style}
                              className="min-w-[calc((100%-4rem)/2)]"
                            >
                              <ProductCard product={product} />
                            </div>
                          ))}
                        </div>
                      );
                    }
                    if (item.slideType === "Magazine") {
                      const magazines = posts.filter((post) =>
                        item.magazineIds!.includes(post._id)
                      );
                      return (
                        <PostsCarousel
                          style={style}
                          key={item.id}
                          posts={magazines}
                        />
                      );
                    }
                  }
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default MobileHighlightCategoryItem;
