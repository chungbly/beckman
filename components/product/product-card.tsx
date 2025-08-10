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
import { Separator } from "../ui/separator";
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
      f.selectedCategory.some((c) =>
        product.categories.some((cat) => cat._id === c.value)
      )
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
        "group bg-[url('/images/product-card-bg.png')] bg-contain !no-underline flex flex-col h-full rounded-none cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
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
        <span className="text-[#777777] text-sm sm:text-xl">
          {product.categories?.[0]?.name} -{product.kvCode}
        </span>
        <h3 className="font-bold text-lg sm:text-2xl text-[#36454F] leading-tight">
          {product.name}
        </h3>
        <span className="text-[#777777] text-sm sm:text-xl">{product.subName}</span>
        <div className="flex-1 flex justify-end flex-col">
          <Separator className="bg-[#D9D9D9]" />

          <div className="flex items-center justify-between gap-1">
            {product.finalPrice && (
              <span className="text-sm sm:text-lg font-bold text-[var(--brown-brand)]">
                {formatCurrency(product.finalPrice)}
              </span>
            )}
            <StarRating
              rating={product.averageRating || 5}
              className={cn("text-sm ", ratingClassName)}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
