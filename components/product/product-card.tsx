"use client";
import { Frame } from "@/app/(admin)/admin/ui/frames/page";
import { cn } from "@/lib/utils";
import { useConfigs } from "@/store/useConfig";
import { Product } from "@/types/product";
import { shimmer, toBase64 } from "@/utils";
import { formatCurrency } from "@/utils/number";
import { ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import StarRating from "./star-rating";

export function ProductCard({
  product,
  priority = false,
  className = "",
  ratingClassName = "",
  soldClassName = "",
  style = {},
}: {
  priority?: boolean;
  product: Product;
  className?: string;
  ratingClassName?: string;
  soldClassName?: string;
  style?: React.CSSProperties;
}) {
  const configs = useConfigs((s) => s.configs);
  const FRAMES = (configs?.FRAMES as Frame[]) || [];
  const frameByCategory = FRAMES.filter(
    (f) =>
      f.type === "Category" &&
      f.selectedCategory.some((c) => product.categories.includes(c.value))
  );
  const frameByProduct = FRAMES.filter(
    (f) =>
      f.type === "Product" && f.selectedProducts.some((c) => product.kvId === c)
  );
  const frameByPrefix = FRAMES.filter(
    (f) =>
      f.type === "Prefix" &&
      f.prefixes.some((c) => product.kvCode.startsWith(c))
  );
  const frameUrl =
    frameByCategory.length > 0
      ? frameByCategory[0].image
      : frameByProduct.length > 0
      ? frameByProduct[0].image
      : frameByPrefix.length > 0
      ? frameByPrefix[0].image
      : "";

  return (
    <Link
      href={`/${product.seo?.slug || "#"}`}
      className={cn(
        "group bg-[var(--light-beige)] !no-underline flex flex-col h-full rounded-none cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
        className
      )}
      style={style}
    >
      <div className="relative aspect-square overflow-hidden flex items-center justify-center">
        {product.seo?.thumbnail ? (
          <Image
            src={product.seo?.thumbnail || ""}
            alt={product.name}
            sizes="(max-width: 640px) 200px, 334px"
            placeholder={`data:image/svg+xml;base64,${toBase64(
              shimmer(700, 475)
            )}`}
            fill
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-110 !m-0"
          />
        ) : (
          <ImageOff size={32} className="text-gray-300" />
        )}
        {frameUrl && (
          <div className="absolute top-0 right-0 left-0 bottom-0">
            <Image src={frameUrl} sizes="300px" alt="Frame" fill />
          </div>
        )}
        {/* <div className="absolute top-2 left-2">
            <Image
              src={LOGO || "/r8ckie-logo.png"}
              alt="R8ckie"
              width={120}
              height={80}
            />
          </div> */}
      </div>
      <div className="p-2 sm:p-3 space-y-1 flex flex-col flex-1 overflow-hidden">
        <h3 className="font-medium leading-tight">{product.name}</h3>
        <div className="flex-1 flex justify-end flex-col">
          <div className="flex items-center justify-between">
            {product.finalPrice && (
              <span className="text-sm sm:text-lg font-bold text-[var(--red-brand)]">
                {formatCurrency(product.finalPrice)}
              </span>
            )}
            {product.finalPrice < product.basePrice && (
              <span
                className={cn(
                  "font-medium mr-1",
                  "line-through text-[var(--red-brand)] opacity-50 text-sm sm:text-lg"
                )}
              >
                {formatCurrency(product.basePrice || 0)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-1">
            <StarRating
              rating={product.averageRating || 5}
              className={cn("text-sm", ratingClassName)}
            />
            <span
              className={cn("text-sm text-[var(--gray-beige)]", soldClassName)}
            >
              Đã bán {product.sold}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
