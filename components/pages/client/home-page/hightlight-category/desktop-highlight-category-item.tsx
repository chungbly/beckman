"use client";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import { HightlightCategoryLayout } from "@/types/admin-layout";
import { Product } from "@/types/product";
import { motion } from "motion/react";
import { Racing_Sans_One } from "next/font/google";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ReactGridLayout from "react-grid-layout";

import { Post } from "@/types/post";
import Link from "next/link";
import ScrollAbleItem from "./scrollable-item";

const racingsansone = Racing_Sans_One({
  subsets: ["latin"],
  weight: ["400"],
});

function DesktopHighlightCategoryItem({
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
  const [containerWidth, setContainerWidth] = useState(1200);
  const ref = useRef<HTMLDivElement | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

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
            <ReactGridLayout
              className="layout hidden sm:block"
              layout={category?.items.map((item) => ({
                i: item.id,
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h,
                static: true,
              }))}
              rowHeight={category.height || height || 380}
              width={containerWidth}
              cols={category?.cols ?? 6}
              compactType="vertical"
              preventCollision={false}
              margin={[10, 10]}
              containerPadding={[0, 0]}
            >
              {category?.items.map((item) => {
                if (!item.isDesktop) return null;
                if (item.type === "Banner" && item.image) {
                  return (
                    <Link
                      href={item.href || "#"}
                      key={item.id}
                      className="relative h-full w-full overflow-hidden"
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
                    <div key={item.id} className="h-full w-full">
                      <ProductCard product={product} />
                    </div>
                  );
                }
                if (item.type === "Scrollable") {
                  if (item.slideType === "Product") {
                    if (!item?.productIds?.length) return null;
                    const itemProducts =
                      item.productIds
                        ?.map((id) => products.find((p) => p.kvId === id))
                        .filter((v) => !!v) || [];
                    return (
                      <div key={item.id}>
                        <ScrollAbleItem item={item} products={itemProducts} />
                      </div>
                    );
                  } else {
                    const magazines =
                      item.magazineIds
                        ?.map((id) => posts.find((p) => p._id === id))
                        .filter((v) => !!v) || [];
                    return (
                      <div key={item.id}>
                        <ScrollAbleItem item={item} posts={magazines} />
                      </div>
                    );
                  }
                }
              })}
            </ReactGridLayout>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default DesktopHighlightCategoryItem;
