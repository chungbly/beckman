import { cn } from "@/lib/utils";
import { FlashDeal as TFlashDeal } from "@/types/flash-deal";
import { Product } from "@/types/product";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Countdown from "./count-down";
import ProductScrollAbleList from "./product-scrollable-list";
import "@fontsource/road-rage/latin.css";


export default function FlashDeal({
  flashDeal,
  products,
}: {
  flashDeal: TFlashDeal;
  products: Product[];
}) {
  return (
    <div
      className={cn("py-8 px-4", flashDeal.className)}
      style={{
        ...(flashDeal.backgroundColor
          ? flashDeal?.backgroundColor.startsWith("#")
            ? {
                backgroundColor: flashDeal.backgroundColor,
              }
            : {
                background: flashDeal.backgroundColor,
              }
          : {
              backgroundColor: "#15374E",
            }),
      }}
    >
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-3xl sm:text-[calc(3rem+2px)] font-road-rage font-bold flex items-center gap-2 text-white">
          Flash
          <Image
            src={"/icons/thunder.svg"}
            width={24}
            height={36}
            priority
            alt="thunder"
          />
          Deal
        </h2>
        <Countdown endTime={flashDeal.endTime} />
        <Link
          href={flashDeal.showMoreLink || "#"}
          className="text-xs sm:text-[calc(1rem+2px)] flex items-center text-white justify-end flex-1 hover:underline"
        >
          Xem thêm
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <ProductScrollAbleList products={products}>
        {flashDeal.showMoreImage && (
          <Link href={flashDeal.showMoreLink || "#"} className="block">
            <Image
              fill
              src={flashDeal.showMoreImage}
              alt="Ảnh hiển thị thêm"
              sizes="200px"
              className="w-full h-full object-cover"
            />
          </Link>
        )}
      </ProductScrollAbleList>
    </div>
  );
}
