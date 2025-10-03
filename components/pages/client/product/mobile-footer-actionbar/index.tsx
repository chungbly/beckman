"use client";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/number";
import { AnimationControls, motion, useAnimation } from "framer-motion";
import { Home, ShoppingCart } from "lucide-react";
import Link from "next/link";

import ImageCarousel from "@/components/image-carousel";
import { ColorSelector } from "@/components/product/color-selector";
import { ProductDetailForm } from "@/components/product/product-detail";
import SizeSelectionGuide from "@/components/product/size-guide-selection";
import { SizeSelector } from "@/components/product/size-selector";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Category } from "@/types/category";
import {
  FormAsyncValidateOrFn,
  FormValidateOrFn,
  ReactFormExtendedApi,
} from "@tanstack/react-form";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MouseEvent, useState } from "react";
import ShoeCare from "../shoe-care";
export type ProductDetailFormValue = ReactFormExtendedApi<
  ProductDetailForm,
  FormValidateOrFn<ProductDetailForm> | undefined,
  FormValidateOrFn<ProductDetailForm> | undefined,
  FormAsyncValidateOrFn<ProductDetailForm> | undefined,
  FormValidateOrFn<ProductDetailForm> | undefined,
  FormAsyncValidateOrFn<ProductDetailForm> | undefined,
  FormValidateOrFn<ProductDetailForm> | undefined,
  FormAsyncValidateOrFn<ProductDetailForm> | undefined,
  FormValidateOrFn<ProductDetailForm> | undefined,
  FormAsyncValidateOrFn<ProductDetailForm> | undefined,
  FormAsyncValidateOrFn<ProductDetailForm> | undefined,
  unknown
>;

const ActionBar = ({
  isOpen,
  setIsOpen,
  form,
  handleAddToCart,
  className,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  form: ProductDetailFormValue;
  handleAddToCart: (e: MouseEvent<HTMLButtonElement>) => Promise<boolean>;
  className?: string;
}) => {
  const router = useRouter();
  return (
    <nav
      className={cn(
        "actionbar h-12 px-2 flex items-center sm:hidden bg-white border-t border-gray-200 z-[51]",
        className
      )}
    >
      <div className="grid grid-cols-4 gap-1 flex-1">
        <div className="col-span-1 grid grid-cols-2 gap-1">
          <Link
            href="/"
            className="col-span-1 flex flex-col items-center justify-center p-2"
          >
            <Home className="h-5 w-5" />
          </Link>
          <Link
            href="/categories"
            className="col-span-1 flex flex-col items-center justify-center p-2"
          >
            <div className="h-5 w-5 bg-[url(/icons/chat.svg)] bg-contain bg-no-repeat bg-center" />
          </Link>
        </div>
        <div className="col-span-3 grid grid-cols-2 ">
          <Button
            className="rounded-none bg-[#15374E] hover:bg-[#15374E]/90 transition-colors text-xs"
            onClick={(e) => {
              if (!isOpen) {
                return setIsOpen(true);
              }
              handleAddToCart(e);
            }}
          >
            <ShoppingCart className="mr-2 w-4 h-4" />
            Thêm vào giỏ
          </Button>
          <form.Field name="finalPriceTotal">
            {(field) => (
              <Button
                className="rounded-none flex-col bg-[#8B1F18] hover:bg-[#6B180F] text-xs"
                onClick={async (e) => {
                  if (!isOpen) {
                    return setIsOpen(true);
                  }
                  const isOK = await handleAddToCart(e);
                  if (!isOK) return;
                  router.push("/gio-hang");
                }}
              >
                Mua ngay
                <span>{formatCurrency(field.state.value)}</span>
              </Button>
            )}
          </form.Field>
        </div>
      </div>
    </nav>
  );
};

function MobileActionBar({
  product,
  shoecareProducts,
  form,
  handleChangeSize,
  handleChangeColor,
  handleAddToCart,
  handleChangeAddons,
  variants,
  category,
}: {
  product: Product;
  form: ProductDetailFormValue;
  shoecareProducts?: Product[] | null;
  handleChangeSize: (size: string) => void;
  handleChangeColor: (color: string) => void;
  handleAddToCart: (
    e: MouseEvent<HTMLButtonElement>,
    controls: AnimationControls
  ) => Promise<boolean>;
  handleChangeAddons: (id: number) => void;
  variants: Product[];
  category?: Category | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const controls = useAnimation();
  const images = product.images.flatMap((image) => image.urls)?.length
    ? product.images.flatMap((image) => image.urls)
    : [product.seo?.thumbnail];
  return (
    <>
      <ActionBar
        className="fixed bottom-0 left-0 right-0"
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        form={form}
        handleAddToCart={(e) => handleAddToCart(e, controls)}
      />
      <Drawer
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <DrawerContent className="" indicatorClassName="hidden">
          <div className="p-4 space-y-2">
            <DrawerHeader className="hidden">
              <DrawerTitle></DrawerTitle>
            </DrawerHeader>
            <div className="flex items-center gap-4 relative">
              <ImageCarousel
                className="w-[100px] h-[100px] max-w-[100px] max-h-[100px] min-w-[100px] min-h-[100px]"
                images={images}
              />
              <motion.div
                className="absolute z-[9999]"
                animate={controls}
                initial={{ opacity: 0 }}
              >
                <Image
                  src={product.seo?.thumbnail || ""}
                  alt={product.name}
                  width={100}
                  height={100}
                  className="object-cover rounded-lg"
                />
              </motion.div>
              <div className="flex flex-col justify-between h-[100px]">
                <div>{product.name}</div>
                <form.Subscribe
                  selector={(state) => ({
                    basePrice: state.values.basePriceTotal,
                    finalPrice: state.values.finalPriceTotal,
                  })}
                >
                  {({ basePrice, finalPrice }) => {
                    return (
                      <div className="flex items-center justify-between">
                        <p className="text-[var(--red-brand)] font-bold">
                          {formatCurrency(finalPrice)}
                        </p>
                        {product.finalPrice < product.basePrice && (
                          <p className="line-through text-sm decoration-[var(--red-brand)]">
                            {formatCurrency(basePrice)}
                          </p>
                        )}
                      </div>
                    );
                  }}
                </form.Subscribe>
              </div>
            </div>
            <Separator />
            {category?.sizeSelectionGuide && (
              <SizeSelectionGuide src={category?.sizeSelectionGuide} />
            )}
            <form.Subscribe
              selector={(state) => ({
                size: state.values.size,
                color: state.values.color,
              })}
            >
              {({ size, color }) => (
                <SizeSelector
                  variants={variants}
                  sizes={product.sizeTags || []}
                  selectedColor={color}
                  selectedSize={size}
                  onSelect={handleChangeSize}
                />
              )}
            </form.Subscribe>
            {product.colorTags?.length > 1 && (
              <form.Field name="color">
                {(field) => (
                  <ColorSelector
                    colors={product.colorTags || []}
                    selectedColor={field.state.value}
                    onSelect={handleChangeColor}
                  />
                )}
              </form.Field>
            )}
            {!!shoecareProducts?.length && (
              <form.Field name="addons">
                {(field) => (
                  <ShoeCare
                    className="mb-4"
                    products={shoecareProducts}
                    addons={field.state.value || []}
                    handleChangeAddons={handleChangeAddons}
                  />
                )}
              </form.Field>
            )}
          </div>
          {
            // this is fix for drawer ::after issue, it covered the actual actionbar
          }
          <ActionBar
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            form={form}
            handleAddToCart={(e) => handleAddToCart(e, controls)}
          />
        </DrawerContent>
      </Drawer>
      <div
        className="fixed bottom-0 left-0 right-0 h-12 z-[9999] pointer-events-none"
        aria-hidden
      />
    </>
  );
}

export default MobileActionBar;
