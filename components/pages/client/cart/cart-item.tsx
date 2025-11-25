import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useAlert } from "@/store/useAlert";
import { CartItem, useCartStore } from "@/store/useCart";
import { useConfigs } from "@/store/useConfig";
import { Product } from "@/types/product";
import { Voucher } from "@/types/voucher";
import { formatCurrency } from "@/utils/number";
import { animate, motion, useMotionValue } from "framer-motion";
import { ChevronDown, MinusIcon, PlusIcon, Trash, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductVariantSelector from "./product-variants-selector";

const ProductItem = ({
  product,
  item,
  isEditable,
  className,
  children,
  voucherAppliedProducts = [],
}: {
  item: CartItem;
  product: Product;
  isEditable?: boolean;
  className?: string;
  children?: React.ReactNode;
  voucherAppliedProducts?: (Product & {
    voucherCode: string;
  })[];
}) => {
  const { setAlert, closeAlert } = useAlert();
  const [isRemoving, setIsRemoving] = useState(false);
  const isMobile = useIsMobile();
  const x = useMotionValue(0);
  const threshold = -30;
  const maxThreshold = -80;

  const handleDragEnd = () => {
    if (x.get() >= threshold) {
      animate(x, 0, { type: "spring", stiffness: 300 });
    } else {
      animate(x, maxThreshold, { type: "spring", stiffness: 300 });
    }
  };

  const handleQuantityChange = async (id: number, newQuantity: number) => {
    if (!Number.isInteger(newQuantity)) return;
    if (newQuantity < 1) {
      handleRemoveItem(id);
      return;
    }
    useCartStore.getState().updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: number) => {
    if (isMobile) {
      setIsRemoving(true);
    } else {
      setAlert({
        title: "Bạn chắc chắn muốn xóa sản phẩm này?",
        description: "Sản phẩm sẽ bị xóa khỏi giỏ hàng",
        variant: "destructive",
        onSubmit: () => {
          setIsRemoving(true);
          closeAlert();
        },
      });
    }
  };

  const toggleSelect = (id: number) => {
    useCartStore.getState().toggleSelect(id);
    if (!voucherAppliedProducts?.length) return;
    const items = useCartStore.getState().items;
    useCartStore.setState({
      items: items.map((i) => {
        if (voucherAppliedProducts.some((p) => p.kvId === i.productId)) {
          return {
            ...i,
            isSelected: !item.isSelected,
          };
        }
        return i;
      }),
    });
  };
  useEffect(() => {
    return x.onChange((latest) => {
      if (latest > 0 || (!isMobile && latest !== 0)) {
        x.set(0); // reset ngay lập tức nếu vượt quá 0
      }
    });
  }, [isMobile]);
  return (
    <div className="relative w-full">
      {/* Nút xoá nền phía sau */}
      <div className="sm:hidden absolute inset-0 flex justify-end items-center pr-4 bg-red-500">
        <motion.button
          className="text-white px-3 py-1  "
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          onClick={() => handleRemoveItem(product.kvId)}
        >
          <Trash2 size={20} className="text-white" />
        </motion.button>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: maxThreshold, right: 0 }}
        style={{ x }}
        onDragEnd={handleDragEnd}
        initial={{ x: 0, opacity: 1 }}
        animate={isRemoving ? { x: -200, opacity: 0 } : { x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        onAnimationComplete={() => {
          if (isRemoving) {
            useCartStore.getState().removeItem(item.productId);
            // xoá sp chính thì xoá luôn cả sp mua kèm
            if (!voucherAppliedProducts?.length) return;
            voucherAppliedProducts.forEach((p) => {
              useCartStore.getState().removeItem(p.kvId);
            });
          }
        }}
        className="bg-[var(--light-beige)]  rounded-sm flex items-center gap-2 z-10 relative"
      >
        <div
          className={cn(
            "rounded-none p-2 lg:p-4 bg-[var(--light-beige)] min-w-full",
            className
          )}
        >
          <div className="grid grid-cols-3 lg:grid-cols-9 gap-4">
            <div className="col-span-1 lg:col-span-3 gap-4 flex lg:items-center">
              <div className="w-[100px] h-[100px] min-w-[100px] relative">
                <Image
                  src={product.seo?.thumbnail}
                  alt={product.name}
                  fill
                  className="object-cover rounded-sm"
                />
                {isEditable && (
                  <Checkbox
                    checked={item.isSelected}
                    onCheckedChange={() => {
                      toggleSelect(product.kvId);
                    }}
                    className="absolute top-2 left-2 rounded-full border-white data-[state=checked]:bg-[var(--red-brand)]"
                  />
                )}
              </div>
              <Link
                href={`/${product.seo?.slug}`}
                className="hidden lg:block col-span-2 hover:text-[var(--red-brand)] hover:underline"
              >
                {product.name}
              </Link>
            </div>
            <div className="flex-1 max-lg:flex max-lg:flex-col col-span-2 lg:col-span-6 grid grid-cols-8 items-center gap-4">
              <Link
                href={`/${product.seo?.slug}`}
                className="block w-full lg:hidden col-span-2 hover:text-[var(--red-brand)] hover:underline"
              >
                {product.name}
              </Link>
              {/* Không yêu cầu làm product variant selector */}
              <div className="cursor-pointer col-span-2 flex w-full lg:flex-col items-center justify-between lg:justify-center text-xs mt-1 ">
                <p className="text-center">Màu: {product.color}</p>
                <ProductVariantSelector product={product}>
                  <div className="flex items-center gap-1">
                    Size: {product.size}
                    <ChevronDown size={16} />
                  </div>
                </ProductVariantSelector>
              </div>
              <div className="col-span-2 lg:col-span-4 flex lg:grid lg:grid-cols-3 gap-4 max-lg:flex-row-reverse max-lg:justify-between w-full">
                {isEditable ? (
                  <div className="bg-white flex items-center border rounded-sm lg:rounded-md w-fit justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 lg:h-6 lg:w-6 "
                      onClick={() =>
                        handleQuantityChange(item.productId, item.quantity - 1)
                      }
                    >
                      <MinusIcon className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      className="w-8 h-4 lg:h-6 lg:w-6  lg:p-0  text-center no-spin border-0 focus-visible:ring-0 focus-visible:border-0 focus-visible:ring-offset-0"
                      value={item.quantity}
                      onChange={(e) => {
                        handleQuantityChange(
                          item.productId,
                          parseInt(e.target.value)
                        );
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 lg:h-6 lg:w-6 "
                      onClick={() =>
                        handleQuantityChange(item.productId, item.quantity + 1)
                      }
                    >
                      <PlusIcon className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground flex items-center">
                    Số lượng: {item.quantity}
                  </span>
                )}
                <div className="text-left lg:text-right max-lg:flex-1 col-span-2 flex flex-1 flex-wrap lg:justify-end items-center gap-2">
                  {!!product.finalPrice &&
                    product.finalPrice < product.basePrice && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatCurrency(product.basePrice)}
                      </div>
                    )}
                  <div className="font-bold text-[var(--red-brand)]">
                    {formatCurrency(product.finalPrice)}
                  </div>
                </div>
              </div>

              {isEditable && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveItem(product.kvId)}
                  className="col-span-2 text-red-500 hover:text-red-500 justify-self-center hidden lg:flex"
                >
                  <Trash size={18} />
                </Button>
              )}
            </div>
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

function CartProductItem({
  product,
  item,
  items,
  shoesCareProducts,
  className,
  isEditable = true,
  vouchers = [],
  voucherAppliedProducts = [],
}: {
  item: CartItem;
  items: CartItem[];
  product: Product;
  shoesCareProducts: Product[];
  vouchers?: Voucher[];
  voucherAppliedProducts?: (Product & {
    voucherCode: string;
  })[];
  className?: string;
  isEditable?: boolean;
}) {
  const configs = useConfigs((s) => s.configs);
  const DONT_SHOW_IN_CART_PAGE_VOUCHER_CODES = (configs?.[
    "DONT_SHOW_IN_CART_PAGE_VOUCHER_CODES"
  ] || []) as string[];
  const handleAddAddon = (id: number) => {
    useCartStore.getState().addAddons(item.productId, [id]);
  };
  const handleRemoveAddon = (id: number) => {
    useCartStore.getState().removeAddons(item.productId, [id]);
  };
  return (
    <ProductItem
      product={product}
      item={item}
      isEditable={isEditable}
      className={className}
      voucherAppliedProducts={voucherAppliedProducts}
    >
      {shoesCareProducts.map((product) => {
        if (!item.addons?.includes(product.kvId) && !isEditable) return null;
        return (
          <div
            key={product._id}
            className="flex items-center justify-between lg:grid grid-cols-2 lg:grid-cols-9 gap-4 mt-4 "
          >
            <div className="lg:col-span-3 flex items-center gap-2">
              {isEditable && (
                <Checkbox
                  checked={
                    item.addons?.includes(product.kvId) && item.isSelected
                  }
                  onCheckedChange={(checked) => {
                    if (!item.isSelected) return;
                    if (checked) {
                      handleAddAddon(product.kvId);
                    } else {
                      handleRemoveAddon(product.kvId);
                    }
                  }}
                  className="rounded-full border-[var(--red-brand)] data-[state=checked]:bg-[var(--red-brand)]"
                />
              )}
              <Link
                className="hover:text-[var(--red-brand)] hover:underline text-sm"
                href={`/${product.seo?.slug}`}
              >
                {product.name}
              </Link>
            </div>

            <div className="col-span-6 lg:grid grid-cols-8 gap-4">
              <div className="col-span-4 hidden lg:block" />
              <div className="text-right col-span-full lg:col-span-2 flex flex-1 justify-end items-center gap-2">
                {!!product.finalPrice &&
                  product.finalPrice < product.basePrice && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatCurrency(product.basePrice)}
                    </div>
                  )}
                <div className="font-bold text-[var(--red-brand)]">
                  {formatCurrency(product.finalPrice)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </ProductItem>
  );
}

export default CartProductItem;
