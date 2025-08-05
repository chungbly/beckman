"use client";

import { APIStatus } from "@/client/callAPI";
import { updateCart } from "@/client/cart.client";
import { getCategory } from "@/client/category.client";
import { getComments } from "@/client/comment.client";
import {
  getProducts,
  getSuggestionProducts,
  getVariants,
} from "@/client/product.client";
import { Breadcrumb } from "@/components/product/breadcrumb";
import { ColorSelector } from "@/components/product/color-selector";
import ProductGallery from "@/components/product/product-gallery";
import { SizeSelector } from "@/components/product/size-selector";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { getUserId } from "@/lib/cookies";
import { cn } from "@/lib/utils";
import { buildCartQuery } from "@/query/order.query";
import { useCartStore } from "@/store/useCart";
import { useCustomerStore } from "@/store/useCustomer";
import { formatCurrency } from "@/utils/number";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { AnimationControls, useAnimation } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import {
  notFound,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { Product, WithContext } from "schema-dts";
import { useStore } from "zustand";
import VoucherZoneContainer from "../pages/client/home-page/voucher-zone/voucher-zone";
import MobileActionBar from "../pages/client/product/mobile-footer-actionbar";
import ProductReviews from "../pages/client/product/review";
import ShoeCare from "../pages/client/product/shoe-care";
import { fbTracking, ggTagTracking } from "../third-parties/utils";
import { Separator } from "../ui/separator";
import ProductDescription from "./product-description";
import SizeSelectionGuide from "./size-guide-selection";
import StarRating from "./star-rating";

export default function ProductPage({
  slug,
  configs,
  userId,
}: {
  slug: string;
  userId: string;
  configs: Record<string, unknown>;
}) {
  const { data: product, isLoading } = useQuery({
    queryKey: ["getProduct", slug, userId],
    queryFn: async () => {
      if (!slug) return null;
      const res = await getProducts(
        {
          slug,
          status: true,
          userId,
        },
        1,
        1
      );
      if (res.status !== APIStatus.OK || !res.data?.length) return null;
      return res.data[0];
    },
  });
  const { data: category } = useQuery({
    queryKey: ["get-category", product?.categories],
    queryFn: async () => {
      if (!product?.categories) return null;
      const res = await getCategory(product.categories[0]);
      if (res.status !== APIStatus.OK || !res.data) return null;
      return res.data;
    },
  });
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: category?.name, href: `danh-muc/${category?.seo.slug || "#"}` },
    {
      label: product?.name,
      href: product?.seo.slug,
    },
  ].filter((t) => t.label);
  const { data: variants } = useQuery({
    queryKey: ["get-product-variants", slug, userId],
    queryFn: async () => {
      if (!slug) return null;
      const res = await getVariants({
        slug,
        userId,
      });
      if (res.status !== APIStatus.OK || !res.data) return null;
      return res.data;
    },
    enabled: !!slug,
  });

  const { data: res } = useQuery({
    queryKey: ["getComments", slug],
    queryFn: async () => {
      if (!slug) return null;
      return await getComments(
        {
          productSlug: slug,
        },
        100,
        1,
        false
      );
    },
  });

  const { data: shoecareProducts } = useQuery({
    queryKey: ["get-shoes-care", slug],
    queryFn: async () => {
      if (!slug) return null;
      const res = await getSuggestionProducts({
        slug: slug,
        status: true,
        suggestionCategoryIds: [configs["SHOECARE_CATEGORY_ID"] as string],
      });
      if (res.status !== APIStatus.OK || !res.data || !res.data?.length)
        return null;
      return res.data;
    },
  });

  const items = useStore(useCartStore, (state) => state.items);
  const shippingInfo = useStore(useCartStore, (s) => s.info);
  const voucherCodes = useStore(useCartStore, (s) => s.userSelectedVouchers);
  const ignoreVouchers = useStore(
    useCartStore,
    (s) => s.userDeselectedAutoAppliedVouchers
  );

  const { data: cart } = useQuery(
    buildCartQuery(
      product && !!items?.length
        ? [
            ...items,
            {
              productId: product.kvId,
              quantity: 1,
              isSelected: true,
            },
          ]
        : [],
      voucherCodes,
      ignoreVouchers,
      shippingInfo?.provinceCode
    )
  );
  const comments = res?.data || [];
  const average =
    comments.reduce((acc, comment) => acc + comment.rating || 0, 0) /
      comments.length || 5;
  const { toast } = useToast();
  const { addItem } = useCartStore();
  const router = useRouter();
  const controls = useAnimation();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [containerHeight, setContainerHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const currentProduct = useMemo(() => {
    const size = searchParams.get("size") || product?.size;
    const color = searchParams.get("color") || product?.color;
    if (!variants || !variants.length) return product;
    return variants.find((p) => p.size == size && p.color === color) || product;
  }, [product, variants, searchParams]);
  const form = useForm({
    defaultValues: {
      kvId: currentProduct?.kvId,
      size: currentProduct?.size,
      color: currentProduct?.color,
      kvCode: currentProduct?.kvCode,
      basePriceTotal: currentProduct?.basePrice || 0,
      finalPriceTotal: currentProduct?.finalPrice || 0,
      addons: [] as number[],
    },
    onSubmit: async ({ value }) => {
      if (!value.kvId) return;
      const userId =
        (await getUserId()) ||
        useCustomerStore.getState().customer?._id ||
        useCustomerStore.getState().userId;
      if (!userId) {
        return toast({
          variant: "error",
          title: "Lỗi",
          description:
            "Xảy ra lỗi bất thường, liên hệ admin. Mã lỗi: 0x01usr09",
        });
      }
      addItem(value.kvId, value.addons);
      await updateCart(userId, {
        items: useCartStore.getState().items,
        shippingInfo,
      });
      fbTracking(
        [currentProduct!],
        category?.name || "",
        "AddToCart",
        value.finalPriceTotal
      );
      ggTagTracking(
        [currentProduct!],
        category?.name || "",
        "add_to_cart",
        value.finalPriceTotal
      );
    },
  });
  const jsonLd: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product?.name,
    image: product?.seo?.thumbnail,
    description: product?.seo?.description || "",
    sku: product?.kvCode,
    category: category?.name,
    review: {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: comments?.length
          ? comments?.reduce((prev, cur) => prev + cur.rating, 0) /
            comments?.length
          : 5,
        bestRating: "5",
      },
      author: {
        "@type": "Person",
        name: comments?.length ? comments?.[0]?.author : "Ẩn danh",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: comments?.length
        ? comments?.reduce((prev, cur) => prev + cur.rating, 0) /
          comments?.length
        : 5,
      reviewCount: comments?.length || 1,
    },
    offers: {
      "@type": "Offer",
      url: `https://r8ckie.com/${product?.seo?.slug}`,
      priceCurrency: "VND",
      price: product?.finalPrice,
      availability: product?.stock ? "InStock" : "OutOfStock",
    },
  };
  const handleAddToCart = async (
    e: MouseEvent<HTMLButtonElement>,
    controls: AnimationControls
  ) => {
    const headerCart = document.getElementById("header-cart");
    if (!headerCart) return false;
    const value = form.getFieldValue("kvId");
    const product = variants?.find((p) => p?.kvId === value);
    if (!product || product.stock <= 0) {
      toast({
        title: "Sản phẩm này không còn hàng",
        description: "Vui lòng chọn sản phẩm khác",
        variant: "error",
      });
      return false;
    }
    const diffX = Math.abs(e.clientX - headerCart?.offsetLeft);
    const diffY = Math.abs(e.clientY - headerCart?.offsetTop);
    await controls.start({
      display: "block",
      opacity: [0, 1, 0],
      scale: [0.5, 1.2, 0.8],
      y: Array.from({ length: 4 }, (_, i) => {
        const step = diffY / 4;
        return -i * step;
      }),
      x: Array.from({ length: 4 }, (_, i) => {
        const step = diffX / (isMobile ? 1.4 : 4);
        return i * step;
      }),
      transition: {
        opacity: { duration: 0.6, ease: "easeOut" },
        scale: { duration: 0.6, ease: "anticipate" },
        x: { duration: 0.7, ease: "easeOut" },
        y: { duration: 0.7, ease: "easeOut" },
      },
    });
    await form.handleSubmit();
    return true;
  };

  const handleChangeSize = (size: string) => {
    const currentColor = form.getFieldValue("color");
    if (size === product?.size && currentColor === product?.color) {
      form.setFieldValue("size", size);
      form.setFieldValue("color", product?.color);
      form.setFieldValue("kvId", product?.kvId);
      form.setFieldValue("kvCode", product?.kvCode);
      router.push(`${pathname}?size=${product.size}`);

      return;
    }
    const childProduct = variants?.find(
      (p) => p.size === size && p.color === currentColor
    );
    if (!childProduct || childProduct.stock <= 0) {
      toast({
        title: "Size này không còn hàng",
        description: "Vui lòng chọn size khác",
        variant: "error",
      });
      return;
    }
    form.setFieldValue("size", size);
    form.setFieldValue("color", currentColor);
    form.setFieldValue("kvId", childProduct?.kvId);
    form.setFieldValue("kvCode", childProduct?.kvCode);
    router.push(`${pathname}?size=${childProduct.size}`);
  };

  const handleChangeColor = (color: string) => {
    if (color === product?.color) {
      form.setFieldValue("color", color);
      form.setFieldValue("size", "");
      form.setFieldValue("kvId", product?.kvId);
      form.setFieldValue("kvCode", product?.kvCode);
      router.push(`/${product.seo.slug}`);
      return;
    }
    const childProduct = variants?.find((p) => p.color === color);
    if (!childProduct) {
      toast({
        title: "Màu này không còn hàng",
        description: "Vui lòng chọn màu khác",
        variant: "error",
      });
      return;
    }
    form.setFieldValue("color", color);
    form.setFieldValue("size", "");
    form.setFieldValue("kvId", childProduct?.kvId);
    form.setFieldValue("kvCode", childProduct?.kvCode);
    router.push(`/${childProduct.seo.slug}`);
  };

  const handleChangeAddons = (id: number) => {
    const currentAddons = form.getFieldValue("addons");
    let newAddons = currentAddons;
    if (currentAddons.includes(id)) {
      newAddons = currentAddons.filter((a: number) => a !== id);
    } else {
      newAddons = [...currentAddons, id];
    }
    const shoecares =
      shoecareProducts?.filter((p) => newAddons.includes(p.kvId)) || [];
    const basePriceTotal = shoecares.reduce(
      (acc, cur) => acc + cur.basePrice,
      0
    );
    const finalPriceTotal = shoecares.reduce(
      (acc, cur) => acc + cur.finalPrice,
      0
    );
    const currentFinalPrice = form.getFieldValue("finalPriceTotal");
    form.setFieldValue(
      "basePriceTotal",
      (product?.basePrice || 0) + basePriceTotal
    );
    form.setFieldValue("finalPriceTotal", currentFinalPrice + finalPriceTotal);
    form.setFieldValue("addons", newAddons);
  };

  useEffect(() => {
    const items = cart?.cart;
    if (!items || !items.length || !product) return;
    const appliedVoucherProducts = items.flatMap((i) => i.appliedProducts);
    const matchedProduct = appliedVoucherProducts.find(
      (p) => p.kvId === product?.kvId
    );
    if (matchedProduct) {
      form.setFieldValue("finalPriceTotal", matchedProduct.finalPrice);
    }
  }, [cart, product]);

  useEffect(() => {
    if (isMobile || !ref.current) return;

    const observer = new ResizeObserver(() => {
      if (ref.current) {
        setContainerHeight(ref.current.offsetHeight);
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  if (isLoading) return <div>Loading...</div>;
  if (!product) return notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={breadcrumbItems}
        className="hidden sm:flex px-4 2xl:px-[100px] text-[var(--brown-brand)]"
      />

      <div
        style={{
          ...(containerHeight && !isMobile
            ? {
                height: containerHeight,
                maxHeight: containerHeight,
                overflow: "hidden",
              }
            : {}),
        }}
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 min-[920px]:grid-cols-10 min-[1120px]:grid-cols-14 xl:grid-cols-3 gap-[10px] sm:gap-[20px] px-0 sm:px-4 2xl:px-[100px]",
          "h-full sm:h-[734px] min-[920px]:h-[750px] min-[1120px]:h-[868px] xl:h-[967px] 2xl:min-h-[880px]",
          "max-sm:!min-h-[647px]"
        )}
      >
        <ProductGallery
          ref={ref}
          product={product!}
          form={form}
          style={{
            height: containerHeight,
            maxHeight: containerHeight,
          }}
          className="col-span-1 sm:col-span-1 min-[920px]:col-span-6 min-[1120px]:col-span-9 xl:col-span-2"
        />
        <div
          style={{
            ...(containerHeight && !isMobile
              ? {
                  height: containerHeight,
                  maxHeight: containerHeight,
                  overflow: "auto",
                }
              : {}),
          }}
          className={cn(
            "hidden sm:block space-y-3 min-[920px]:col-span-4 min-[1120px]:col-span-5 xl:col-span-1 h-[880px] overflow-auto",
            "h-full sm:h-[734px] min-[920px]:h-[750px] min-[1120px]:h-[868px] xl:h-[967px] 2xl:min-h-[880px]"
          )}
        >
          {/* <h1 className="text-2xl font-bold mb-2">
            {product?.name || product?.kvFullName}
          </h1> */}
          <form.Field name="kvCode">
            {(field) => (
              <div className="text-sm text-muted-foreground">
                SKU: {field.state.value}
              </div>
            )}
          </form.Field>
          <form.Subscribe
            selector={(state) => ({
              basePrice: state.values.basePriceTotal,
              finalPrice: state.values.finalPriceTotal,
            })}
          >
            {({ basePrice, finalPrice }) => {
              return (
                <>
                  {product.finalPrice < product.basePrice && (
                    <p className="line-through text-xl decoration-[var(--red-brand)]">
                      {formatCurrency(basePrice)}
                    </p>
                  )}
                  <p className="text-[var(--red-brand)] font-bold text-3xl">
                    {formatCurrency(finalPrice)}
                  </p>
                </>
              );
            }}
          </form.Subscribe>

          <div className="flex items-center justify-between">
            <div className="flex gap-1 items-center">
              <StarRating rating={average} />
              {comments.length > 0 && (
                <span className="text-sm text-[var(--gray-beige)]">
                  ({comments.length})
                </span>
              )}
            </div>
            <span className="text-sm text-[var(--gray-beige)] ml-2">
              Đã bán {product.sold}
            </span>
          </div>
          {product.sizeTags?.length > 1 && (
            <>
              <form.Subscribe
                selector={(state) => ({
                  color: state.values.color,
                  size: state.values.size,
                })}
              >
                {({ color, size }) => (
                  <SizeSelector
                    variants={variants || []}
                    sizes={product.sizeTags || []}
                    selectedSize={size}
                    selectedColor={color}
                    onSelect={handleChangeSize}
                  />
                )}
              </form.Subscribe>
              {category?.sizeSelectionGuide && (
                <SizeSelectionGuide src={category?.sizeSelectionGuide} />
              )}
            </>
          )}

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
                  products={shoecareProducts}
                  addons={field.state.value || []}
                  handleChangeAddons={handleChangeAddons}
                />
              )}
            </form.Field>
          )}
          {!!product.gifts?.length && (
            <div className="border rounded-lg p-4 space-y-2 hidden sm:block">
              <div className="font-semibold flex items-center gap-2">
                <span className="text-lg">🎁</span>
                Quà tặng đi kèm
              </div>
              <ul className="space-y-1">
                {product?.gifts.map((gift, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span>-</span>
                    {gift}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Button
              className="bg-[#15374E] hover:bg-[#15374E]/90 transition-colors rounded-none"
              onClick={(e) => handleAddToCart(e, controls)}
            >
              Thêm vào giỏ hàng
              <ShoppingCart className="ml-2 w-4 h-4" />
              {!isMobile && (
                <motion.div
                  className="absolute z-[9999]"
                  animate={controls}
                  initial={{ opacity: 0, display: "none" }}
                >
                  <Image
                    src={product.seo?.thumbnail || ""}
                    alt={product.name}
                    width={100}
                    height={100}
                    className="object-cover rounded-lg"
                  />
                </motion.div>
              )}
            </Button>
            <form.Field name="finalPriceTotal">
              {(field) => (
                <Button
                  className="flex-1 bg-[#8B1F18] hover:bg-[#6B180F] rounded-none"
                  onClick={async (e) => {
                    const isOK = await handleAddToCart(e, controls);
                    if (!isOK) return;
                    router.push("/gio-hang");
                  }}
                >
                  Mua ngay {formatCurrency(field.state.value)}
                </Button>
              )}
            </form.Field>
          </div>

          <VoucherZoneContainer size="small" userId={userId} />
        </div>
      </div>

      <div className="flex items-center justify-between sm:hidden my-4 px-2">
        <div className="flex gap-1 items-center">
          <StarRating rating={average} />
          {comments.length > 0 && (
            <span className="text-sm text-[var(--gray-beige)]">
              ({comments.length})
            </span>
          )}
        </div>
        <span className="text-sm text-[var(--gray-beige)] ml-2">
          Đã bán {product.sold}
        </span>
      </div>
      <Separator className="my-2" />
      {!!product.gifts?.length && (
        <div className="border rounded-lg p-4 space-y-2 sm:hidden">
          <div className="font-semibold flex items-center gap-2">
            <span className="text-lg">🎁</span>
            Quà tặng đi kèm
          </div>
          <ul className="space-y-1">
            {product?.gifts.map((gift, index) => (
              <li key={index} className="flex items-center gap-2">
                <span>-</span>
                {gift}
              </li>
            ))}
          </ul>
        </div>
      )}
      <VoucherZoneContainer userId={userId} className="sm:hidden" />

      <ProductDescription product={product} />
      <Separator className="my-4" />
      <ProductReviews comments={comments} />

      <MobileActionBar
        product={product}
        variants={variants || []}
        shoecareProducts={shoecareProducts}
        handleChangeColor={handleChangeColor}
        handleChangeSize={handleChangeSize}
        handleAddToCart={handleAddToCart}
        form={form}
        handleChangeAddons={handleChangeAddons}
        category={category}
      />
    </>
  );
}
