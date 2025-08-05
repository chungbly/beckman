"use client";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getProductsQuery } from "@/query/product.query";
import { useCartStore } from "@/store/useCart";
import { formatCurrency } from "@/utils/number";
import { HoverCardArrow } from "@radix-ui/react-hover-card";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart, Trash, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { v4 } from "uuid";
import { useStore } from "zustand";

const EmptyCartDialog = () => {
  return (
    <HoverCardContent
      className="max-sm:hidden w-[400px] flex flex-col items-center p-4 z-[51]"
      align="end"
    >
      <HoverCardArrow className="fill-slate-200" />
      <Image
        src="/illustrations/empty-cart.svg"
        alt="empty-cart"
        width={200}
        height={200}
        className="w-[200px] h-auto object-cover"
      />
      <p className="text-md mt-4 text-neutral-400">Giỏ hàng trống!</p>
      <p className="text-sm mt-4 text-neutral-400">
        Không có sản phẩm nào trong giỏ hàng
      </p>
    </HoverCardContent>
  );
};

function HeaderCart() {
  const params = useParams();
  const pathname = usePathname();
  const items = useStore(useCartStore, (state) => state.items);
  const productIds = items.map((item) => item.productId);

  const isProductPage = !!params.productSlug;
  const isCartPage = pathname === "/gio-hang";
  const { data: products, isLoading } = useQuery({
    ...getProductsQuery(
      {
        ids: productIds,
      },
      productIds.length,
      1
    ),
    enabled: !!productIds.length,
    placeholderData: keepPreviousData,
  });

  return (
    <HoverCard openDelay={100} closeDelay={200}>
      <HoverCardTrigger asChild>
        <Link href="/gio-hang">
          <Button
            variant="ghost"
            id="header-cart"
            className={cn(
              "hidden sm:block relative focus:bg-transparent focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0  p-4 h-fit max-sm:border-0 hover:bg-[var(--header-color)] hover:text-white",
              (isProductPage || isCartPage) && "block"
            )}
          >
            <ShoppingCart className="w-[20px] text-white h-[20px] sm:w-[26px] sm:h-[26px]" />
            <AnimatePresence mode="popLayout">
              <motion.span
                key={items.length}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="max-sm:text-xs rounded-full text-black bg-white shadow-md absolute top-1 right-1 translate-x-[60%] -translate-y-1/2 min-h-3 min-w-4 sm:min-h-[20px] sm:min-w-[20px]"
              >
                {items.length}
              </motion.span>
            </AnimatePresence>
          </Button>
        </Link>
      </HoverCardTrigger>
      {(!isLoading && !products?.length) || !items.length ? (
        <EmptyCartDialog />
      ) : (
        <HoverCardContent
          align="end"
          className="w-[400px] p-0 z-[51] max-sm:hidden"
          sideOffset={8}
        >
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sản phẩm mới thêm</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Separator />

            <div className="space-y-6 max-h-[500px] overflow-y-auto">
              {isLoading && !products ? (
                <div key={v4()} className="flex gap-4">
                  <div className="relative h-24 w-24 flex-none rounded-lg overflow-hidden border bg-muted">
                    <Skeleton className="absolute inset-0" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Skeleton className="w-[200px] h-6" />
                    <div className="text-sm text-muted-foreground">
                      <Skeleton className="w-[150px] h-4" />
                      <Skeleton className="w-[100px] h-4" />
                      <Skeleton className="w-[90px] h-4" />
                    </div>
                    <Skeleton className="w-[100px] h-4" />
                  </div>
                </div>
              ) : (
                products!.map((item) => {
                  const imageUrl =
                    item.seo?.thumbnail || item.images[0].urls?.[0];
                  const quantity = items.find(
                    (cartItem) => cartItem.productId === item.kvId
                  )?.quantity;
                  return (
                    <div
                      key={v4()}
                      className="flex gap-4 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      <div className="relative h-24 w-24 flex-none rounded-lg overflow-hidden border bg-muted ">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.name}
                            layout="fill"
                            objectFit="cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-neutral-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <Link
                          href={`/${item.seo?.slug}`}
                          className="font-medium leading-tight hover:underline"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <p>Màu sắc: {item.color}</p>
                            <p>Kích cỡ: {item.size}</p>
                            <p>Số lượng: {quantity}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-black/20"
                            onClick={() => {
                              useCartStore.getState().removeItem(item.kvId);
                            }}
                          >
                            <Trash className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[var(--red-brand)] font-bold text-xl">
                            {formatCurrency(item.finalPrice)}
                          </p>
                          {!!item.finalPrice &&
                            item.finalPrice < item.basePrice && (
                              <p className="line-through decoration-[var(--red-brand)]">
                                {formatCurrency(item.basePrice)}
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t p-4">
            <Button
              variant="ghost"
              size="lg"
              className="bg-[var(--rose-beige)] hover:bg-[var(--light-beige)] w-full text-base font-medium"
              asChild
            >
              <Link href="/gio-hang">Xem giỏ hàng</Link>
            </Button>
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  );
}

export default HeaderCart;
