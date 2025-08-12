"use client";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

function ProductScrollAbleList({
  products,
  children,
  className,
}: {
  products: Product[];
  children?: React.ReactNode;
  className?: string;
}) {
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

  return (
    <div className={cn("relative group/flash-deal", className)}>
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
      >
        {products.map((product) => (
          <div
            key={product._id}
            className="2xl:w-[calc((100%-5rem)/5)] lg:w-[calc((100%-5rem)/4)] w-[calc((100%-5rem)/2)] flex-none"
          >
            <ProductCard product={product} ratingClassName="hidden sm:flex" />
          </div>
        ))}
      </div>

      {products.length > 6 && (
        <>
          <button
            onClick={() => scroll("left")}
            className="shadow-lg absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover/flash-deal:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 text-[#15374E]" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="shadow-lg absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover/flash-deal:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5 text-[#15374E]" />
          </button>
        </>
      )}
    </div>
  );
}
export default ProductScrollAbleList;
