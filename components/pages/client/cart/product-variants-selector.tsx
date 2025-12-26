import { APIStatus } from "@/client/callAPI";
import { updateCart } from "@/client/cart.client";
import { getVariants } from "@/client/product.client";
import ImageCarousel from "@/components/image-carousel";
import { SizeSelector } from "@/components/product/size-selector";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/store/useCart";
import { useCustomerStore } from "@/store/useCustomer";
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/number";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

function ProductVariantSelector({
  product,
  children,
  className,
}: {
  product: Product;
  children: React.ReactNode;
  className?: string;
}) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedSize, setSelectedSize] = useState(product.size);
  const images = product.images.flatMap((image) => image.urls)?.length
    ? product.images.flatMap((image) => image.urls)
    : [product.seo?.thumbnail];
  const { data: variants, isLoading } = useQuery({
    queryKey: ["get-product-variants", product.kvId],
    queryFn: async () => {
      const res = await getVariants({
        slug: product.seo?.slug,
      });
      if (res.status !== APIStatus.OK || !res.data) return null;
      return res.data;
    },
    enabled: !!product.kvId,
  });

  const handleChangeSize = (size: string) => {
    if (size === product.size) return;
    const newProduct = variants?.find(
      (p) => p.size == size && p.color == product.color
    );
    if (!newProduct) {
      return toast({
        variant: "error",
        title: "Không tìm thấy sản phẩm",
        description: "Không tìm thấy sản phẩm tương ứng, hãy thử tải lại trang",
      });
    }
    const newItems = useCartStore.getState().items.map((i) => {
      if (i.productId === product.kvId) {
        return {
          ...i,
          productId: newProduct.kvId,
        };
      }
      return i;
    });
    useCartStore.setState({
      items: newItems,
    });

    const customer = useCustomerStore.getState().customer;
    const customerId = customer?._id || useCustomerStore.getState().userId;
    if (!customerId) return;
    updateCart(customerId, {
      items: newItems,
      shippingInfo: useCartStore.getState().info,
    });
  };

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="z-[52] p-4 " indicatorClassName="hidden">
          <div className="space-y-2">
            <DrawerHeader className="hidden">
              <DrawerTitle></DrawerTitle>
            </DrawerHeader>
            <div className="flex items-center gap-4 relative">
              <ImageCarousel
                className="w-[100px] h-[100px] max-w-[100px] max-h-[100px] min-w-[100px] min-h-[100px]"
                images={images}
              />
              <div className="flex flex-col justify-between h-[100px]">
                <div>{product.name}</div>
                <div className="flex items-center justify-between">
                  <p className="text-[var(--red-brand)] font-bold">
                    {formatCurrency(product.finalPrice)}
                  </p>
                  {product.finalPrice < product.basePrice && (
                    <p className="line-through text-sm decoration-[var(--red-brand)]">
                      {formatCurrency(product.basePrice)}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Separator />
            <SizeSelector
              variants={variants || []}
              sizes={product.sizeTags || []}
              selectedColor={product.color}
              selectedSize={selectedSize}
              onSelect={(s) => setSelectedSize(s)}
            />
            {/* {product.colorTags?.length > 1 && (
              <ColorSelector
                colors={product.colorTags || []}
                selectedColor={product.color}
                onSelect={handleChangeColor}
              />
            )} */}
          </div>
          <DrawerClose className="w-full" asChild>
            <Button
              onClick={() => handleChangeSize(selectedSize)}
              className="w-full bg-[var(--red-brand)] mt-8"
            >
              Xác nhận
            </Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className={className}>
        <SizeSelector
          sizes={product.sizeTags}
          selectedColor={product.color}
          selectedSize={product.size}
          variants={variants || []}
          onSelect={handleChangeSize}
        />
      </PopoverContent>
    </Popover>
  );
}

export default ProductVariantSelector;
