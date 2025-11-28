"use client";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCart";
import { formatCurrency } from "@/utils/number";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "zustand";

import { APIStatus } from "@/client/callAPI";
import { updateCart } from "@/client/cart.client";
import {
  getDistricts,
  getProvinces,
  getWards,
} from "@/client/master-data.client";
import { createOrder } from "@/client/order.client";
import CartProductItem from "@/components/pages/client/cart/cart-item";
import CartItemSkeleton from "@/components/pages/client/cart/cart-item-skeleton";
import EmptyCart from "@/components/pages/client/cart/empty-cart";
import MobileActionBar from "@/components/pages/client/cart/mobile-action-bar";
import OrderInfo from "@/components/pages/client/cart/order-info";
import SuggestionAndSimilarProducts from "@/components/pages/client/cart/suggestion-and-similar-products";
import { fbTracking, ggTagTracking } from "@/components/third-parties/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { getUserId } from "@/lib/cookies";
import { buildCartQuery } from "@/query/order.query";
import { useConfigs } from "@/store/useConfig";
import { useCustomerStore } from "@/store/useCustomer";
import { formSchema } from "@/types/cart";
import { CartBuilderRes } from "@/types/order";
import { useForm } from "@tanstack/react-form";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export const LineInfo = ({
  title,
  value,
}: {
  title: React.ReactNode;
  value: React.ReactNode;
}) => {
  return (
    <div className="w-full grid grid-cols-9 gap-4 ">
      <div className="col-span-3 text-sm">{title}</div>
      <div className="col-span-6 grid grid-cols-8 gap-4">
        <div className="col-span-3" />
        <div className="col-span-5 sm:col-span-3 justify-self-end flex items-center">
          {value}
        </div>
      </div>
    </div>
  );
};

function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const configs = useConfigs((s) => s.configs);
  const items = useStore(useCartStore, (state) => state.items);
  const shippingInfo = useStore(useCartStore, (s) => s.info);
  const productIds = items.map((item) => item.productId);
  const totalSelected = items.reduce(
    (sum, item) => sum + (item.isSelected ? 1 : 0),
    0
  );

  const SHIPPING_FEE_DEFAULT = (configs?.["SHIPPING_FEE_DEFAULT"] ??
    35000) as number;

  const { data: cart, isLoading } = useQuery(
    buildCartQuery(items, shippingInfo?.provinceCode, shippingInfo?.phoneNumber)
  );
  const getAddressDetail = async (
    address: string,
    pronvinceCode: number,
    districtCode: number,
    wardCode: number
  ) => {
    const getProvincesResp = await getProvinces();
    if (!getProvincesResp || getProvincesResp.status !== APIStatus.OK) return;
    const provinces = getProvincesResp.data;
    const province = provinces.find((p) => p.ProvinceID === pronvinceCode);
    if (!province) return;
    const getDistrictResp = await getDistricts(pronvinceCode);
    if (!getDistrictResp || getDistrictResp.status !== APIStatus.OK) return;
    const districts = getDistrictResp.data;
    const district = districts.find((p) => p.DistrictID === districtCode);
    if (!district) return;

    const getWardsResp = await getWards(districtCode);
    if (!getWardsResp || getWardsResp.status !== APIStatus.OK) return;
    const wards = getWardsResp.data;
    const ward = wards.find((p) => p.WardCode === wardCode.toString());
    if (!ward) return;
    return `${address}, ${ward.WardName}, ${district.DistrictName}, ${province.ProvinceName}`;
  };
  const { cart: products, ...prices } = (cart || {}) as CartBuilderRes;
  const form = useForm({
    defaultValues: shippingInfo,
    onSubmit: async ({ value }) => {
      if (!totalSelected) return;
      useCartStore.getState().setInfo(value);
      const { note, address, ...rest } = value;
      const detailAddress = await getAddressDetail(
        address,
        rest.provinceCode,
        rest.districtCode,
        rest.wardCode
      );
      if (!detailAddress) {
        return toast({
          title: "Thông tin không hợp lệ",
          description: "Địa chỉ mua hàng không tồn tại, vui lòng kiểm tra lại",
          variant: "error",
        });
      }
      const { fullName, phoneNumber } = rest;
      if (!fullName) {
        return toast({
          variant: "error",
          title: "Lỗi",
          description: "Vui lòng nhập họ và tên",
        });
      }
      if (!phoneNumber || !/^\d{10,11}$/.test(phoneNumber)) {
        return toast({
          variant: "error",
          title: "Lỗi",
          description: "Vui lòng nhập số điện thoại hợp lệ",
        });
      }
      const shippingInfo = {
        ...rest,
        address: detailAddress,
      };
      const userId =
        (await getUserId()) ||
        useCustomerStore.getState().customer?._id ||
        useCustomerStore.getState().userId;
      const isAnonymous = !userId || userId?.includes("-");
      if (!userId) {
        return toast({
          variant: "error",
          title: "Lỗi",
          description:
            "Xảy ra lỗi bất thường, liên hệ admin. Mã lỗi: 0x01usr09",
        });
      }
      const payload = {
        items: items
          .filter((i) => i.quantity > 0 && i.isSelected)
          .map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            addons: i.addons || [],
          })),
        shippingInfo,
        note,
        voucherCodes: [],
      };

      const res = await createOrder(payload);
      if (res.status !== APIStatus.OK) {
        return toast({
          title: "Đặt hàng không thành công",
          description: res.message,
          variant: "error",
        });
      }
      await new Promise((resolve) => {
        ggTagTracking(products, "purchase", "purchase", prices.finalPrice);
        fbTracking(products, "Purchase", "Purchase", prices.finalPrice);
        setTimeout(resolve, 1000);
      });
      const order = res.data;
      const orderCode = order?.code;
      if (process.env.NODE_ENV === "production") {
        useCartStore.getState().clearCart();
        useCartStore.getState().setInfo({
          ...shippingInfo,
          note: "",
        });
        await updateCart(userId, {
          items: [],
          shippingInfo,
          userSelectedVouchers: [],
          ignoreVouchers: [],
        });
      }

      router.push(`/don-hang/${orderCode}`);
    },
    validators: {
      ...(!isMobile ? { onSubmit: formSchema } : {}),
    },
  });

  const isLoadingPrice = (isLoading || !prices) && !!items.length;

  const isSelectedAll = items.every((item) => {
    const product = (products || []).find((p) => p.kvId === item.productId);
    if (!product) return item.isSelected;
    return (
      product.addons.every((addon) => addon.quantity! > 0) && item.isSelected
    );
  });

  const {
    finalPrice,
    totalPrice,
    shippingFee,
    totalSaved,
    cartFixedDiscount,
    totalSalePrice,
    discount,
  } = (prices || {}) as CartBuilderRes;

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

  return (
    <div className="bg-white min-h-screen max-sm:mb-[56px] pt-4 sm:pt-12">
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

            <div className="space-y-2 bg-[var(--light-beige)] p-2 sm:p-4 mt-4">
              <p className="font-bold">Chi tiết thanh toán</p>
              <LineInfo
                title={"Tổng tiền hàng"}
                value={
                  isLoadingPrice ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin text-[var(--brown-brand)]"
                    />
                  ) : (
                    formatCurrency(totalSalePrice)
                  )
                }
              />
              <LineInfo
                title={"Phí vận chuyển"}
                value={
                  isLoadingPrice ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin text-[var(--brown-brand)]"
                    />
                  ) : (
                    <span className="text-[var(--red-brand)]">
                      {formatCurrency(items.length ? SHIPPING_FEE_DEFAULT : 0)}
                    </span>
                  )
                }
              />
              <LineInfo
                title={"Giảm phí vận chuyển"}
                value={
                  isLoadingPrice ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin text-[var(--brown-brand)]"
                    />
                  ) : (
                    <span className="text-[var(--red-brand)]">
                      {formatCurrency(shippingFee - SHIPPING_FEE_DEFAULT)}
                    </span>
                  )
                }
              />
              <LineInfo
                title={"Voucher ưu đãi"}
                value={
                  isLoadingPrice ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin text-[var(--brown-brand)]"
                    />
                  ) : (
                    <span className="text-[var(--red-brand)]">
                      {formatCurrency(discount)}
                    </span>
                  )
                }
              />
              <Separator />
              <LineInfo
                title={"Tổng thanh toán"}
                value={
                  isLoadingPrice ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin text-[var(--red-brand)]"
                    />
                  ) : (
                    <span className="text-[var(--red-brand)] font-bold">
                      {formatCurrency(finalPrice)}
                    </span>
                  )
                }
              />
            </div>

            <div className="max-sm:hidden z-[51] space-y-1">
              {/* {!!cartFixedDiscount && (
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
              )} */}
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
                          className="animate-spin text-[var(--red-brand)]"
                        />
                      ) : (
                        <span className="font-bold text-base text-[var(--red-brand)]">
                          {formatCurrency(finalPrice)}
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
                        className="col-span-2 rounded-none bg-[#CD7F32] text-white font-bold "
                        onClick={form.handleSubmit}
                      >
                        {isSubmitting ? "Đang xử lý..." : "MUA NGAY"}
                      </Button>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <OrderInfo form={form as any} />
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
      />
    </div>
  );
}

export default CartPage;
