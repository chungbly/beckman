"use client";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCart";
import { formatCurrency } from "@/utils/number";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "zustand";

import { updateCart } from "@/client/cart.client";
import CartProductItem from "@/components/pages/client/cart/cart-item";
import CartItemSkeleton from "@/components/pages/client/cart/cart-item-skeleton";
import EmptyCart from "@/components/pages/client/cart/empty-cart";
import MobileActionBar from "@/components/pages/client/cart/mobile-action-bar";
import OrderInfo from "@/components/pages/client/cart/order-info";
import SuggestionAndSimilarProducts from "@/components/pages/client/cart/suggestion-and-similar-products";
import { ggTagTracking } from "@/components/third-parties/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { getUserId } from "@/lib/cookies";
import { buildCartQuery } from "@/query/order.query";
import { getCouponsQuery, getUserVouchersQuery } from "@/query/voucher.query";
import { useCustomerStore } from "@/store/useCustomer";
import { formSchema } from "@/types/cart";
import { CartBuilderRes } from "@/types/order";
import { useForm } from "@tanstack/react-form";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const items = useStore(useCartStore, (state) => state.items);
  const voucherCodes = useStore(useCartStore, (s) => s.userSelectedVouchers);
  const ignoreVouchers = useStore(useCartStore, (s) => s.ignoreVouchers);
  const shippingInfo = useStore(useCartStore, (s) => s.info);
  const customer = useCustomerStore((s) => s.customer);
  const productIds = items.map((item) => item.productId);
  const totalSelected = items.reduce(
    (sum, item) => sum + (item.isSelected ? 1 : 0),
    0
  );

  const { data: cart, isLoading } = useQuery(
    buildCartQuery(
      items,
      voucherCodes,
      ignoreVouchers,
      shippingInfo?.provinceCode,
      shippingInfo?.phoneNumber
    )
  );

  const {
    cart: products,
    appliedVoucherCodes,
    invalidVouchers,
    ...prices
  } = (cart || {}) as CartBuilderRes;

  const form = useForm({
    defaultValues: shippingInfo,
    onSubmit: async ({ value }) => {
      if (!totalSelected) return;
      useCartStore.getState().setInfo(value);
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
      await new Promise((resolve) => {
        ggTagTracking(products || [], "", "begin_checkout", prices.finalPrice);
        setTimeout(resolve, 1000);
      });
      await updateCart(userId, {
        items,
        userSelectedVouchers: voucherCodes,
        ignoreVouchers,
        shippingInfo: value,
      });
      router.push("/dat-hang");
    },
    ...(!isMobile && {
      validators: {
        onSubmit: formSchema,
      },
    }),
  });
  const phoneNumber = form.getFieldValue("phoneNumber");

  const { data: userVouchers } = useQuery(
    getUserVouchersQuery({
      ...(phoneNumber
        ? { phoneNumber }
        : {
            userId:
              useCustomerStore.getState().customer?._id ||
              useCustomerStore.getState().userId ||
              "",
          }),
    })
  );
  const { data: coupons } = useQuery(getCouponsQuery());
  const vouchers = Array.from(
    new Set(
      [...(userVouchers || []), ...(coupons || [])].filter((v) => {
        if (!v.isCoupon) {
          if (!v.isPrivate) return true;
          return v.isPrivate && customer?.voucherCodes?.includes(v.code);
        }
        return appliedVoucherCodes?.includes(v.code);
      })
    )
  );

  const isLoadingPrice = (isLoading || !prices) && !!items.length;

  const isSelectedAll = items.every((item) => {
    const product = (products || []).find((p) => p.kvId === item.productId);
    if (!product) return item.isSelected;
    return (
      product.addons.every((addon) => addon.quantity! > 0) && item.isSelected
    );
  });

  const { finalPrice, totalPrice, shippingFee, totalSaved, cartFixedDiscount } =
    (prices || {}) as CartBuilderRes;

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      useCartStore.getState().selectAll();
      useCartStore.getState().items.map((i) => {
        const addons =
          products?.find((p) => p.kvId === i.productId)?.addons || [];
        if (addons.length) {
          useCartStore.getState().addAddons(
            i.productId,
            addons.map((i) => i.kvId)
          );
        }
      });
    } else {
      useCartStore.getState().unselectAll();
      useCartStore.getState().items.forEach((i) => {
        useCartStore.getState().clearAddons(i.productId);
      });
    }
  };

  useEffect(() => {
    useCartStore.getState().setAutoAppliedVouchers(appliedVoucherCodes || []);
    useCartStore.setState({
      userSelectedVouchers: voucherCodes.filter(
        (v) => !appliedVoucherCodes.includes(v)
      ),
    });
  }, [appliedVoucherCodes]);

  return (
    <div className="bg-white min-h-screen max-sm:mb-[56px]">
      <div className="container py-6 max-sm:px-0">
        <h1 className="text-2xl font-bold mb-6 max-sm:px-2">Giỏ hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              Array(items.length || 3)
                .fill(0)
                .map((_, index) => <CartItemSkeleton key={index} />)
            ) : !products?.length || !items.length ? (
              <EmptyCart />
            ) : (
              items.map((item, index) => {
                const product = products.find((p) => p.kvId === item.productId);
                if (!product) return null;
                return (
                  <CartProductItem
                    key={item.productId + index}
                    product={product}
                    shoesCareProducts={product.addons}
                    vouchers={product.couponsEligible || []}
                    voucherAppliedProducts={product.appliedProducts || []}
                    item={item}
                    items={items}
                  />
                );
              })
            )}
            <div className="max-sm:hidden z-[51] space-y-1">
              {!!cartFixedDiscount && (
                <div className="bg-[var(--light-beige)] w-full sm:grid grid-cols-9 gap-4 p-4">
                  <p className="col-span-3 flex items-center gap-2 font-bold text-[var(--red-brand)]">
                    Giá trị giảm thêm
                  </p>
                  <div className="col-span-6 grid grid-cols-8 gap-4 ">
                    <div className="col-span-3" />
                    <div className="col-span-3 justify-self-end">
                      {isLoadingPrice ? (
                        <LoaderCircle
                          size={18}
                          className="animate-spin text-[var(--brown-brand)]"
                        />
                      ) : (
                        <span className="font-bold  text-[var(--red-brand)]">
                          {formatCurrency(cartFixedDiscount)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-[var(--light-beige)] w-full sm:grid grid-cols-9 gap-4 p-4">
                <div className="col-span-3 flex items-center gap-2">
                  <Checkbox
                    checked={isSelectedAll}
                    onCheckedChange={toggleSelectAll}
                    className="rounded-full border-[var(--red-brand)] data-[state=checked]:bg-[var(--red-brand)]"
                  />
                  <span>Tất cả</span>
                </div>
                <div className="col-span-6 grid grid-cols-8 gap-4 ">
                  <div className="col-span-3" />
                  <div className="col-span-3 justify-self-end">
                    <p className="text-xs flex items-center gap-1">
                      Tổng tiền:{" "}
                      {isLoadingPrice ? (
                        <LoaderCircle
                          size={18}
                          className="animate-spin text-[var(--brown-brand)]"
                        />
                      ) : (
                        <span className="font-bold text-base text-[var(--red-brand)]">
                          {formatCurrency(finalPrice - shippingFee)}
                        </span>
                      )}
                    </p>
                    <p className="text-xs flex items-center gap-1">
                      Tiết kiệm:{" "}
                      {isLoadingPrice ? (
                        <LoaderCircle
                          size={18}
                          className="animate-spin text-[var(--brown-brand)]"
                        />
                      ) : (
                        <span className="text-xs text-[var(--red-brand)]">
                          {formatCurrency(totalSaved)}
                        </span>
                      )}
                    </p>
                  </div>
                  <form.Subscribe
                    selector={(state) => [state.isSubmitting]}
                    children={([isSubmitting]) => (
                      <Button
                        variant="ghost"
                        disabled={
                          !totalSelected ||
                          !prices ||
                          !Object.keys(prices).length ||
                          isSubmitting
                        }
                        className="col-span-2 rounded-none bg-[var(--red-brand)] text-white "
                        onClick={form.handleSubmit}
                      >
                        {isSubmitting ? "Đang xử lý..." : "Mua hàng"}
                      </Button>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <OrderInfo vouchers={vouchers || []} form={form as any} />
        </div>
        <SuggestionAndSimilarProducts ids={productIds} />
      </div>
      <MobileActionBar
        items={items}
        totalSelected={totalSelected}
        toggleSelectAll={toggleSelectAll}
        finalPrice={finalPrice - shippingFee}
        totalSaved={totalSaved}
        onSubmit={form.handleSubmit}
        isLoading={isLoadingPrice}
        vouchers={vouchers || []}
      />
    </div>
  );
}

export default CartPage;
