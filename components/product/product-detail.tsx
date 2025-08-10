"use client";

import { APIStatus } from "@/client/callAPI";
import { updateCart } from "@/client/cart.client";
import { getComments } from "@/client/comment.client";
import { getProducts, getVariants } from "@/client/product.client";
import ProductGallery from "@/components/product/product-gallery";
import { SizeSelector } from "@/components/product/size-selector";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { getUserId } from "@/lib/cookies";
import { cn } from "@/lib/utils";
import { buildCartQuery } from "@/query/order.query";
import { useCartStore } from "@/store/useCart";
import { useCustomerStore } from "@/store/useCustomer";
import { Category } from "@/types/category";
import { formatCurrency } from "@/utils/number";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { AnimationControls, useAnimation } from "framer-motion";
import { Dot } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import {
  notFound,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { MouseEvent, useEffect, useMemo, useRef } from "react";
import { Product, WithContext } from "schema-dts";
import { useStore } from "zustand";
import RenderHTMLFromCMS from "../app-layout/render-html-from-cms";
import ProductReviews from "../pages/client/product/review";
import { fbTracking, ggTagTracking } from "../third-parties/utils";
import { ScrollArea } from "../ui/scroll-area";
import ProductDescription from "./product-description";
import SizeSelectionGuide from "./size-guide-selection";

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
  console.log("product", product);
  const category = product?.categories[0] as unknown as Category;
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
      name: currentProduct?.name,
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
      router.push(`${pathname}?size=${product.size}`, {
        scroll: false,
      });

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
    router.push(`${pathname}?size=${childProduct.size}`, { scroll: false });
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

  if (isLoading) return <div>Loading...</div>;
  if (!product) return notFound();

  return (
    <>
      <div className="container mx-auto px-2 sm:py-6 max-sm:mb-[48px]">
        <script
          defer
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-[20px]")}>
          <ProductGallery
            ref={ref}
            product={product!}
            form={form}
            className="col-span-1 sm:col-span-1"
          />
          <div
            className={cn(
              "space-y-3 min-[920px]:col-span-4 min-[1120px]:col-span-5 xl:col-span-1 ",
              "h-full sm:h-[1700px] relative"
            )}
          >
            <form.Field name="kvCode">
              {(field) => (
                <div className="text-base sm:text-xl text-muted-foreground">
                  {category?.name} - {field.state.value}
                </div>
              )}
            </form.Field>
            <form.Field name="name">
              {(field) => (
                <h1 className="uppercase font-bold text-[#36454F] text-2xl sm:text-4xl">
                  {field.state.value}
                </h1>
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
                      <p className="line-through text-xl sm:text-2xl decoration-[var(--brown-brand)]">
                        {formatCurrency(basePrice)}
                      </p>
                    )}
                    <p className="text-[var(--brown-brand)] font-bold text-2xl sm:text-4xl">
                      {formatCurrency(finalPrice)}
                    </p>
                  </>
                );
              }}
            </form.Subscribe>
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
            {!!product.similarProducts?.length && (
              <>
                <div className="text-2xl">Sản phẩm tương tự</div>
                <ScrollArea>
                  <div className="flex items-center gap-6 mb-4">
                    {product.similarProducts.map((p) => {
                      const image = p.images.find((i) => i.color === p.color);
                      const colorThumbnail = image?.thumbnail;
                      const altName = image?.altName || image?.color;
                      if (!altName) return null;

                      return (
                        <div key={p._id} className="flex items-center gap-2">
                          <Image
                            src={colorThumbnail || p.seo?.thumbnail || ""}
                            alt={p.name}
                            sizes="100px"
                            width={50}
                            height={50}
                            className="object-cover rounded-full w-[50px] h-[50px]"
                          />
                          <p className="text-xl hover:underline cursor-pointer">
                            {altName}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button
                className="bg-[#36454F] hover:bg-[#36454F] hover:shadow-[0_5px_5px_rgba(54,69,79,0.25)] rounded-none transition-shadow"
                onClick={(e) => handleAddToCart(e, controls)}
              >
                THÊM VÀO GIỎ
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
              <Button
                className="flex-1 bg-[#CD7F32] hover:bg-[#CD7F32] hover:shadow-[0_5px_5px_rgba(54,69,79,0.25)] rounded-none"
                onClick={async (e) => {
                  const isOK = await handleAddToCart(e, controls);
                  if (!isOK) return;
                  router.push("/gio-hang");
                }}
              >
                MUA NGAY
              </Button>
            </div>
            <div className="flex items-center border p-3 border-[var(--gray-beige)]">
              <Image
                src="/icons/free-shipping.svg"
                width={51}
                height={30}
                alt="Giao hàng miễn phí"
              />
              <div className="text-[var(--brown-brand)] flex items-center text-xl">
                <Dot />
                <b>
                  MIỄN PHÍ giao hàng toàn quốc - thời gian giao từ 5 - 7 ngày
                </b>
              </div>
            </div>
            <p>{product?.subDescription}</p>

            <Tabs
              defaultValue="product-details"
              className="w-full border-t border-t-[var(--gray-beige)] sm:p-4 pt-2"
            >
              <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="product-details"
                  className="text-black/50 data-[state=active]:text-[var(--brown-brand)] data-[state=active]:bg-transparent   data-[state=active]:rounded-none data-[state=active]:shadow-none text-base sm:text-2xl font-normal"
                >
                  Chi tiết sản phẩm
                </TabsTrigger>
                <TabsTrigger
                  value="warranty-policy"
                  className="text-black/50 data-[state=active]:text-[var(--brown-brand)] data-[state=active]:bg-transparent border-l border-r border-[var(--brown-brand)] rounded-none data-[state=active]:shadow-none text-base sm:text-2xl font-normal"
                >
                  Chính sách bảo hành
                </TabsTrigger>
                <TabsTrigger
                  value="care-guide"
                  className="text-black/50 data-[state=active]:text-[var(--brown-brand)] data-[state=active]:bg-transparent   data-[state=active]:rounded-none data-[state=active]:shadow-none text-base sm:text-2xl font-normal"
                >
                  Hướng dẫn bảo quản
                </TabsTrigger>
              </TabsList>
              <TabsContent value="product-details" className="mt-4">
                <div>
                  {product.discribles.map((item, index) => (
                    <div
                      key={item.title}
                      className={cn(
                        "grid grid-cols-4 p-2",
                        index % 2 === 0 && "bg-[#FFECD9]"
                      )}
                    >
                      <p className="max-sm:text-sm col-span-1 text-[#36454F]">
                        {item.title}
                      </p>
                      <p className="max-sm:text-sm col-span-3">
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="warranty-policy" className="mt-4">
                <RenderHTMLFromCMS
                  className="max-sm:text-sm"
                  html={product.warrantyPolicy}
                />
              </TabsContent>
              <TabsContent value="care-guide" className="mt-4">
                <RenderHTMLFromCMS
                  className="max-sm:text-sm"
                  html={product.careInstructions}
                />
              </TabsContent>
            </Tabs>

            {/* Shoes Tree Product List */}
            <ScrollArea className="h-[750px] absolute bottom-0 border-t border-[#e8e1d7]">
              <div className="space-y-4  pt-4">
                {/* Product 1 */}
                {product.recommendedProducts?.map((p) => {
                  return (
                    <div
                      key={p._id}
                      className="flex border-b border-[#e8e1d7] pb-4"
                    >
                      <Image
                        width={200}
                        height={200}
                        src={p.seo?.thumbnail || ""}
                        alt={p.name}
                        className="aspect-square object-cover w-[200px]"
                      />
                      <div className="w-2/3 pl-4 flex flex-col justify-between">
                        <div className="space-y-[10px]">
                          <h3 className="text-2xl font-medium text-[#36454F]">
                            {p.name}
                          </h3>
                          <div className="flex items-center mt-1">
                            {p.finalPrice < p.basePrice && (
                              <p className="line-through text-xl font-light decoration-[var(--brown-brand)]">
                                {formatCurrency(p.basePrice)}
                              </p>
                            )}
                            <p className="text-[var(--brown-brand)] text-2xl">
                              {formatCurrency(p.finalPrice)}
                            </p>
                          </div>
                          {/* <p className="text-sm text-gray-600 mt-2">
                            Order with a pair of shoes, and receive 25% off your
                            pair
                          </p>
                          <p className="text-sm text-gray-600">
                            100% Cedar Wood
                          </p> */}
                        </div>
                        <button
                          onClick={async () => {
                            if (p.sizeTags?.length > 1) {
                              router.push(`/${p.seo?.slug}`);
                            } else {
                              addItem(p.kvId);
                              await updateCart(userId, {
                                items: useCartStore.getState().items,
                                shippingInfo,
                              });
                            }
                          }}
                          className="border-[#CD7F32] border  text-[#CD7F32] py-2 px-4 mt-2 hover:bg-[#e8e1d7] transition-colors w-fit"
                        >
                          {p.sizeTags?.length > 1 ? "CHỌN LỰA" : "THÊM VÀO GIỎ"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
      <ProductDescription product={product} />
      <div className="container mx-auto px-0 sm:py-6 max-sm:mb-[48px]">
        <ProductReviews comments={comments} />
      </div>
    </>
  );
}
