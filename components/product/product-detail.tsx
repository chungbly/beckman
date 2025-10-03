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
import { MouseEvent, useEffect, useMemo, useRef } from "react";
import { Product, WithContext } from "schema-dts";
import { useStore } from "zustand";
import MobileActionBar from "../pages/client/product/mobile-footer-actionbar";
import ProductReviews from "../pages/client/product/review";
import { fbTracking, ggTagTracking } from "../third-parties/utils";
import ProductDescription from "./product-description";
import SizeSelectionGuide from "./size-guide-selection";
import StarRating from "./star-rating";
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

  if (isLoading) return <div>Loading...</div>;
  if (!product) return notFound();

  return (
    <>
      <div className="container mx-auto px-0 sm:py-6 max-sm:mb-[48px]">
        <script
          defer
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-[20px]")}>
          <ProductGallery
            product={product!}
            className="col-span-1 sm:col-span-1"
          />
          <div
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
                <div className="text-xl text-muted-foreground">
                  {category?.name} - {field.state.value}
                </div>
              )}
            </form.Field>
            <form.Field name="name">
              {(field) => (
                <div className="uppercase font-bold text-[#36454F] text-4xl">
                  {field.state.value}
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
                      <p className="line-through text-2xl decoration-[var(--brown-brand)]">
                        {formatCurrency(basePrice)}
                      </p>
                    )}
                    <p className="text-[var(--brown-brand)] font-bold text-4xl">
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
              <form.Field name="finalPriceTotal">
                {(field) => (
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
                )}
              </form.Field>
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

            <Tabs
              defaultValue="product-details"
              className="w-full border-t border-t-[var(--gray-beige)] p-4"
            >
              <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="product-details"
                  className="text-black/50 data-[state=active]:text-[var(--brown-brand)] data-[state=active]:bg-transparent   data-[state=active]:rounded-none data-[state=active]:shadow-none text-2xl font-normal"
                >
                  Chi tiết sản phẩm
                </TabsTrigger>
                <TabsTrigger
                  value="warranty-policy"
                  className="text-black/50 data-[state=active]:text-[var(--brown-brand)] data-[state=active]:bg-transparent border-l border-r border-[var(--brown-brand)] rounded-none data-[state=active]:shadow-none text-2xl font-normal"
                >
                  Chính sách bảo hành
                </TabsTrigger>
                <TabsTrigger
                  value="care-guide"
                  className="text-black/50 data-[state=active]:text-[var(--brown-brand)] data-[state=active]:bg-transparent   data-[state=active]:rounded-none data-[state=active]:shadow-none text-2xl font-normal"
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
                      <p className="col-span-1  text-[#36454F]">{item.title}</p>
                      <p className="col-span-3">{item.content}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="warranty-policy" className="mt-4">
                <div className="space-y-3">
                  <p className="text-gray-700">
                    Chúng tôi cam kết bảo hành sản phẩm trong vòng 12 tháng kể
                    từ ngày mua hàng với các điều kiện sau:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li>Bảo hành miễn phí đối với các lỗi từ nhà sản xuất</li>
                    <li>
                      Sửa chữa hoặc thay thế phần bị lỗi (đế, mũi giày, gót
                      giày)
                    </li>
                    <li>
                      Bảo hành không áp dụng cho các trường hợp hao mòn tự nhiên
                      do sử dụng
                    </li>
                    <li>
                      Sản phẩm phải còn nguyên tem, nhãn mác và hóa đơn mua hàng
                    </li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="care-guide" className="mt-4">
                <div className="space-y-3">
                  <p className="text-gray-700">
                    Để giữ cho đôi giày luôn đẹp và bền, vui lòng tuân thủ các
                    hướng dẫn sau:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li>Sử dụng xi đánh giày chuyên dụng cho da bò</li>
                    <li>
                      Tránh tiếp xúc trực tiếp với nước, nếu bị ướt cần lau khô
                      ngay
                    </li>
                    <li>
                      Để giày ở nơi khô ráo, thoáng mát, tránh ánh nắng trực
                      tiếp
                    </li>
                    <li>
                      Sử dụng cây giữ form khi không sử dụng để giữ dáng giày
                    </li>
                    <li>Vệ sinh giày định kỳ 2-3 tháng/lần</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
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
      </div>
      <ProductDescription product={product} />
      <div className="container mx-auto px-0 sm:py-6 max-sm:mb-[48px]">
        <ProductReviews comments={comments} />
      </div>
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
