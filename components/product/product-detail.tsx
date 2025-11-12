"use client";

import { APIStatus } from "@/client/callAPI";
import { updateCart } from "@/client/cart.client";
import { getComments } from "@/client/comment.client";
import {
  getProducts,
  getSuggestionProducts,
  getVariants,
} from "@/client/product.client";
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
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { Product, WithContext } from "schema-dts";
import { useStore } from "zustand";
import RenderHTMLFromCMS from "../app-layout/render-html-from-cms";
import MobileActionBar from "../pages/client/product/mobile-footer-actionbar";
import ProductReviews from "../pages/client/product/review";
import { fbTracking, ggTagTracking } from "../third-parties/utils";
import ReadMore from "../ui/read-more";
import { ScrollArea } from "../ui/scroll-area";
import SizeSelectionGuide from "./size-guide-selection";
import Link from "next/link";
export type ProductDetailForm = {
  name: string | undefined;
  kvId: number | undefined;
  size: string | undefined;
  color: string | undefined;
  kvCode: string | undefined;
  basePriceTotal: number;
  finalPriceTotal: number;
  addons: number[];
};
const sections = [
  { id: "product-info", label: "Thông tin" },
  { id: "product-details", label: "Chi tiết" },
  { id: "warranty-policy", label: "Bảo hành" },
  { id: "care-guide", label: "Bảo quản" },
  { id: "review", label: "Đánh giá" },
];

const MobileInfoSection = ({
  children,
  title,
  id,
}: {
  children: React.ReactNode;
  title: string;
  id: string;
}) => {
  return (
    <div id={id} className="space-y-[10px] mx-2 sm:hidden">
      <div className="text-xl">{title}</div>
      <div className="block w-full h-[4px] bg-[var(--brown-brand)]"></div>
      {children}
    </div>
  );
};

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
  const categories = product?.categories;
  const category = categories?.[0];

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
  const ignoreVouchers = useStore(useCartStore, (s) => s.ignoreVouchers);
  const [active, setActive] = useState("product-info");
  const listRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

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

  const defaultValues: ProductDetailForm = {
    name: currentProduct?.name,
    kvId: currentProduct?.kvId,
    size: currentProduct?.size,
    color: currentProduct?.color,
    kvCode: currentProduct?.kvCode,
    basePriceTotal: currentProduct?.basePrice || 0,
    finalPriceTotal: currentProduct?.finalPrice || 0,
    addons: [] as number[],
  };

  const form = useForm({
    defaultValues,
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
      url: `https://beckman.com/${product?.seo?.slug}`,
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

  const [isScrollingByClick, setIsScrollingByClick] = useState(false);
  const scrollTargetRef = useRef<number | null>(null);

  const handleScrollToTab = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const tabList = document.querySelector('[role="tablist"]') as HTMLElement;
    const header = document.querySelector("header") as HTMLElement;
    const offset = (tabList?.offsetHeight || 0) + (header?.offsetHeight || 0);
    const targetY = el.getBoundingClientRect().top + window.scrollY - offset;

    setIsScrollingByClick(true);
    scrollTargetRef.current = targetY;

    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!isMobile) return;
    const handleScroll = () => {
      // Nếu đang scroll bằng click → kiểm tra khi nào tới nơi thì unlock
      if (isScrollingByClick && scrollTargetRef.current !== null) {
        const currentY = window.scrollY;
        const diff = Math.abs(currentY - scrollTargetRef.current);

        // Khi tới gần target (ví dụ < 3px) thì coi như scroll xong
        if (diff < 3) {
          setIsScrollingByClick(false);
          scrollTargetRef.current = null;
        }
        return; // 🚨 bỏ qua tracking khi đang auto scroll
      }

      // Scroll tracking khi user tự cuộn
      const tabList = document.querySelector('[role="tablist"]') as HTMLElement;
      const header = document.querySelector("header") as HTMLElement;
      const offset = (tabList?.offsetHeight || 0) + (header?.offsetHeight || 0);
      let currentSection = sections[0].id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const top = el.getBoundingClientRect().top - offset;
          if (top <= 3) {
            currentSection = s.id;
          } else {
            break;
          }
        }
      }
      setActive(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrollingByClick, sections, isMobile]);

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
    ggTagTracking(
      [currentProduct!],
      category?.name || "",
      "view_item",
      product?.finalPrice
    );
  }, [slug]);

  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    const activeEl = listEl.querySelector(
      `[data-value="${active}"]`
    ) as HTMLElement;
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [active]);
  if (isLoading) return <div>Loading...</div>;
  if (!product) return notFound();

  return (
    <>
      <div className="container mx-auto px-2 sm:px-0 sm:py-6 max-sm:mb-[48px] max-sm:mt-[36px]">
        <script
          defer
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-[20px]")}>
          <ProductGallery
            product={product!}
            className="col-span-1 sm:col-span-1 max-sm:-mx-2"
          />
          <div
            className={cn(
              "space-y-3 sm:col-span-1 ",
              "h-full sm:h-[1200px] md:h-[1200px] xl:h-[1200px] relative",
              !!product.recommendedProducts?.length
                ? "xl:h-[1200px]"
                : "md:h-[1000px] xl:h-[1000px]"
            )}
          >
            <form.Field name="kvCode">
              {(field) => (
                <div className="text-xs xl:text-xl text-muted-foreground">
                  {category?.name} - {field.state.value}
                </div>
              )}
            </form.Field>
            <form.Field name="name">
              {(field) => (
                <div className="uppercase font-bold text-[#36454F] text-2xl sm:text-4xl">
                  {field.state.value}
                </div>
              )}
            </form.Field>
            <div className="text-xs xl:text-xl text-muted-foreground">
              {currentProduct?.subName}
            </div>
            <div className="flex items-center justify-between">
              <form.Subscribe
                selector={(state) => ({
                  basePrice: state.values.basePriceTotal,
                  finalPrice: state.values.finalPriceTotal,
                })}
              >
                {({ basePrice, finalPrice }) => {
                  return (
                    <div className="flex items-center gap-2">
                      {product.finalPrice < product.basePrice && (
                        <p className="line-through sm:text-2xl decoration-[var(--brown-brand)] text-black/50">
                          {formatCurrency(basePrice)}
                        </p>
                      )}
                      <p className="text-[var(--brown-brand)] font-bold text-2xl sm:text-4xl">
                        {formatCurrency(finalPrice)}
                      </p>
                    </div>
                  );
                }}
              </form.Subscribe>
              {category?.sizeSelectionGuide && (
                <SizeSelectionGuide src={category?.sizeSelectionGuide} />
              )}
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
              </>
            )}
            {!!product.similarProducts?.length && (
              <>
                <div className="sm:text-2xl">Sản phẩm tương tự</div>
                <ScrollArea>
                  <div className="flex items-center gap-6 mb-4">
                    {product.similarProducts.map((p) => {
                      const image = p.images.find((i) => i.color === p.color);
                      const colorThumbnail = image?.thumbnail;
                      const altName = image?.altName || image?.color;
                      if (!altName) return null;

                      return (
                        <Link
                          href={`/${p.seo?.slug}`}
                          key={p._id} className="flex items-center gap-2">
                          <Image
                            src={colorThumbnail || p.seo?.thumbnail || ""}
                            alt={p.name}
                            sizes="100px"
                            width={50}
                            height={50}
                            className="object-cover bg-slate-50 rounded-full w-[30px] h-[30px] sm:w-[50px] sm:h-[50px]"
                          />
                          <p className="text-xs sm:text-xl hover:underline cursor-pointer">
                            {altName}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button
                className="sm:text-2xl sm:h-[60px] bg-[#36454F] hover:bg-[#36454F] hover:shadow-[0_5px_5px_rgba(54,69,79,0.25)] rounded-none transition-shadow"
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
                className="sm:text-2xl sm:h-[60px] flex-1 bg-[#CD7F32] hover:bg-[#CD7F32] hover:shadow-[0_5px_5px_rgba(54,69,79,0.25)] rounded-none"
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
              <div className="text-[var(--brown-brand)] flex items-center sm:text-lg">
                <Dot />
                <b>
                  MIỄN PHÍ giao hàng toàn quốc - thời gian giao từ 5 - 7 ngày
                </b>
              </div>
            </div>
            <RenderHTMLFromCMS
              className="sm:text-2xl text-black"
              html={product.subDescription}
            />

            {/* Shoes Tree Product List */}
            {!!product.recommendedProducts?.length && (
              <ScrollArea className="h-fit sm:h-[750px] absolute bottom-0 border-t-2 border-black/50">
                <div className="space-y-4  pt-4">
                  {/* Product 1 */}
                  {product.recommendedProducts?.map((p, index) => {
                    return (
                      <div
                        key={p._id}
                        className={cn(
                          "flex border-b border-black/50 pb-4",
                          index === product.recommendedProducts?.length - 1
                            ? "border-b-0"
                            : ""
                        )}
                      >
                        <Image
                          width={200}
                          height={200}
                          src={p.seo?.thumbnail || ""}
                          alt={p.name}
                          className="aspect-square object-cover w-[140px] h-[140px] sm:w-[200px] sm:h-[200px]"
                        />
                        <div className="w-2/3 pl-4 flex flex-col justify-between">
                          <div className="space-y-[10px]">
                            <h3 className="sm:text-2xl font-medium text-[#36454F]">
                              {p.name}
                            </h3>
                            <div className="flex items-center mt-1">
                              {p.finalPrice < p.basePrice && (
                                <p className="line-through text-xs text-black/50 sm:text-xl font-light decoration-[var(--brown-brand)]">
                                  {formatCurrency(p.basePrice)}
                                </p>
                              )}
                              <p className="text-[var(--brown-brand)] sm:text-2xl">
                                {formatCurrency(p.finalPrice)}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              {p.subDescription}
                            </p>
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
                            className="max-sm:w-[160px] border-[#CD7F32] border  text-[#CD7F32] py-2 px-4 mt-2 hover:bg-[#e8e1d7] transition-colors w-fit"
                          >
                            {p.sizeTags?.length > 1
                              ? "CHỌN LỰA"
                              : "THÊM VÀO GIỎ"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </div>
      <div className="bg-[#F0F0F0]">
        <div className="container mx-auto px-0 max-sm:mb-[48px] ">
          <Tabs
            value={active}
            onValueChange={(value) => {
              setActive(value);
              handleScrollToTab(value);
            }}
            className="w-full"
          >
            <TabsList
              ref={listRef}
              className={cn(
                "relative grid w-full grid-cols-5 bg-white sm:bg-[#F0F0F0] p-0 h-auto",
                "max-sm:fixed max-sm:top-[60px] max-sm:left-0 max-sm:right-0 max-sm:z-50 rounded-none"
              )}
              onClick={() => handleScrollToTab(active)}
            >
              <TabsTrigger
                data-value="product-info"
                value="product-info"
                className="text-black data-[state=active]:bg-transparent border-b-4 border-transparent transition-all sm:text-lg font-normal"
              >
                Thông tin
              </TabsTrigger>
              <TabsTrigger
                data-value="product-details"
                value="product-details"
                className="text-black data-[state=active]:bg-transparent border-b-4 border-transparent transition-all sm:text-lg font-normal"
              >
                Chi tiết
              </TabsTrigger>
              <TabsTrigger
                data-value="warranty-policy"
                value="warranty-policy"
                className="text-black data-[state=active]:bg-transparent border-b-4 border-transparent transition-all sm:text-lg font-normal"
              >
                Bảo hành
              </TabsTrigger>
              <TabsTrigger
                data-value="care-guide"
                value="care-guide"
                className="text-black data-[state=active]:bg-transparent border-b-4 border-transparent transition-all sm:text-lg font-normal"
              >
                Bảo quản
              </TabsTrigger>
              <TabsTrigger
                data-value="review"
                value="review"
                className="text-black data-[state=active]:bg-transparent border-b-4 border-transparent transition-all sm:text-lg font-normal"
              >
                Đánh giá
              </TabsTrigger>

              {/* underline indicator */}
              <span
                className="absolute bottom-0 h-[4px] bg-[var(--brown-brand)] transition-all duration-300"
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                }}
              />
            </TabsList>
            {isMobile ? (
              <div className="space-y-[10px]">
                <MobileInfoSection id="product-info" title="Thông tin">
                  <RenderHTMLFromCMS
                    className="max-sm:text-sm"
                    html={product.description}
                  />
                </MobileInfoSection>
                <MobileInfoSection id="product-details" title="Chi tiết">
                  <div className="p-2 bg-white">
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
                </MobileInfoSection>
                <MobileInfoSection id="warranty-policy" title="Bảo hành">
                  <RenderHTMLFromCMS
                    className="max-sm:text-sm"
                    html={product.warrantyPolicy}
                  />
                </MobileInfoSection>
                <MobileInfoSection id="care-guide" title="Bảo quản">
                  <RenderHTMLFromCMS
                    className="max-sm:text-sm"
                    html={product.careInstructions}
                  />
                </MobileInfoSection>
                <MobileInfoSection id="review" title="Đánh giá">
                  <ProductReviews comments={comments} />
                </MobileInfoSection>
              </div>
            ) : (
              <>
                <TabsContent value="product-info" className="max-sm:px-2 mt-4">
                  <ReadMore>
                    <RenderHTMLFromCMS
                      className="max-sm:text-sm"
                      html={product.description}
                    />
                  </ReadMore>
                </TabsContent>
                <TabsContent
                  value="product-details"
                  className="max-sm:px-2 mt-4 "
                >
                  <div className="p-2 bg-white">
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
                <TabsContent
                  value="warranty-policy"
                  className="max-sm:px-2 mt-4"
                >
                  <ReadMore>
                    <RenderHTMLFromCMS
                      className="max-sm:text-sm"
                      html={product.warrantyPolicy}
                    />
                  </ReadMore>
                </TabsContent>
                <TabsContent value="care-guide" className="max-sm:px-2 mt-4">
                  <ReadMore>
                    <RenderHTMLFromCMS
                      className="max-sm:text-sm"
                      html={product.careInstructions}
                    />
                  </ReadMore>
                </TabsContent>
                <TabsContent value="review" className="max-sm:px-2 mt-4">
                  <ReadMore>
                    <ProductReviews comments={comments} />
                  </ReadMore>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>

      <MobileActionBar
        product={product}
        variants={variants || []}
        shoecareProducts={product.recommendedProducts}
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
