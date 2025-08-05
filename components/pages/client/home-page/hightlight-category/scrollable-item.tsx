"use client";
import { ProductCard } from "@/components/product/product-card";
import { LayoutItem } from "@/types/admin-layout";
import { Post } from "@/types/post";
import { Product } from "@/types/product";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import PostItem from "./post-item";

const ScrollAbleItem = ({
  item,
  products,
  posts,
}: {
  item: LayoutItem;
  products?: Product[];
  posts?: Post[];
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 500;
    const container = scrollContainerRef.current;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };
  const isScrollable = item.type === "Scrollable";
  const itemsLength = products?.length || posts?.length || 0;
  const isShowScroll =
    item.slideType === "Product"
      ? itemsLength >= item.w
      : itemsLength >= item.w / 2;
  return (
    <div className="group/scrollable relative h-full">
      <div
        ref={scrollContainerRef}
        className="h-full w-full flex gap-[10px] overflow-x-auto max-w-full scrollbar-hide"
      >
        {isScrollable
          ? !!products?.length
            ? products.map((product) => (
                <div
                  key={product._id}
                  style={{
                    minWidth:
                      item.w > 1 ? `calc((100% - 40px)/${item.w})` : "100%",
                    maxWidth:
                      item.w > 1 ? `calc((100% - 40px)/${item.w})` : "100%",
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))
            : !!posts?.length &&
              posts.map((post) => (
                <div
                  key={post._id}
                  style={{
                    minWidth:
                      item.w > 1 ? `calc((100% - 10px)/${item.w / 2})` : "100%",
                    maxWidth:
                      item.w > 1 ? `calc((100% - 10px)/${item.w / 2})` : "100%",
                  }}
                >
                  <PostItem post={post} className="w-full h-auto aspect-square" />
                </div>
              ))
          : null}
      </div>
      {isShowScroll && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-4 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover/scrollable:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 text-[#15374E]" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover/scrollable:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5 text-[#15374E]" />
          </button>
        </>
      )}
    </div>
  );
};
export default ScrollAbleItem;
