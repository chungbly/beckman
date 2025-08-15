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
import RenderHTMLFromCMS from "@/components/app-layout/render-html-from-cms";
import CartProductItem from "@/components/pages/client/cart/cart-item";
import CartItemSkeleton from "@/components/pages/client/cart/cart-item-skeleton";
import EmptyCart from "@/components/pages/client/cart/empty-cart";
import MobileActionBar from "@/components/pages/client/cart/mobile-action-bar";
import OrderInfo from "@/components/pages/client/cart/order-info";
import { fbTracking, ggTagTracking } from "@/components/third-parties/utils";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getUserId } from "@/lib/cookies";
import { buildCartQuery } from "@/query/order.query";
import { getAllAvailabeCoupon } from "@/query/voucher.query";
import { useConfigs } from "@/store/useConfig";
import { useCustomerStore } from "@/store/useCustomer";
import { formSchema, TOrderInfo } from "@/types/cart";
import { CartBuilderRes } from "@/types/order";
import { useForm } from "@tanstack/react-form";
import { LoaderCircle, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

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

function PurchasePage() {
  const router = useRouter();
  const { toast } = useToast();
  const configs = useConfigs((s) => s.configs);
  const items = useStore(useCartStore, (state) => state.items);
  const shippingInfo = useStore(useCartStore, (s) => s.info);
  const voucherCodes = useStore(useCartStore, (s) => s.userSelectedVouchers);
  const customer = useCustomerStore((s) => s.customer);
  const ignoreVouchers = useStore(
    useCartStore,
    (s) => s.userDeselectedAutoAppliedVouchers
  );
  const totalSelected = items.reduce(
    (sum, item) => sum + (item.isSelected ? 1 : 0),
    0
  );

  const { data: cart, isLoading } = useQuery(
    buildCartQuery(
      items,
      voucherCodes,
      ignoreVouchers,
      shippingInfo?.provinceCode
    )
  );

  const {
    cart: products,
    appliedVoucherCodes,
    invalidVouchers,
    ...prices
  } = (cart || {}) as CartBuilderRes;

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

  const form = useForm<TOrderInfo>({
    defaultValues: {
      ...shippingInfo,
    },
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
      const shippingInfo = {
        ...rest,
        address: detailAddress,
      };
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
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          addons: i.addons || [],
        })),
        shippingInfo,
        note,
        ...(customer ? { customerId: userId } : {}),
        voucherCodes,
      };

      const res = await createOrder(payload);
      if (res.status !== APIStatus.OK) {
        return toast({
          title: "Đặt hàng không thành công",
          description: res.message,
          variant: "error",
        });
      }
      const order = res.data;
      const orderCode = order?.code;
      ggTagTracking(products, "purchase", "", prices.finalPrice);
      ggTagTracking(products, "begin_checkout", "", prices.finalPrice);
      fbTracking(products, "Purchase", "", prices.finalPrice);

      if (process.env.NODE_ENV === "production") {
        useCartStore.getState().clearCart();
        useCartStore.getState().setInfo({
          ...shippingInfo,
          note: "",
        });
        await updateCart(userId, {
          items: [],
          shippingInfo,
        });
      }

      router.push(`/don-hang/${orderCode}`);
    },
    validators: {
      onSubmit: formSchema,
    },
  });

  const { data: vouchers } = useQuery(getAllAvailabeCoupon);

  const isLoadingPrice = (isLoading || !prices) && !!items.length;

  const SHIPPING_FEE_DEFAULT = (configs?.["SHIPPING_FEE_DEFAULT"] ||
    35000) as number;
  const {
    finalPrice,
    shippingFee,
    totalPrice,
    discount,
    saved,
    totalSaved,
    totalSalePrice,
  } = (prices || {}) as CartBuilderRes;
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      useCartStore.getState().selectAll();
    } else {
      useCartStore.getState().unselectAll();
    }
  };

  useEffect(() => {
    useCartStore.getState().setAutoAppliedVouchers(appliedVoucherCodes || []);
  }, [appliedVoucherCodes]);

  useEffect(() => {
    if (invalidVouchers?.length) {
      toast({
        title: "Voucher không hợp lệ",
        description: `${invalidVouchers
          .map((v) => v.code)
          .join(", ")}. Hệ thống sẽ tự động loại bỏ voucher này.`,
        variant: "error",
      });

      invalidVouchers.forEach((v) => {
        useCartStore.getState().removeVoucher(v.code);
      });
    }
  }, [invalidVouchers]);

  return (
    <div className="bg-white min-h-screen max-sm:mb-[56px]">
      <div className="container py-6 max-sm:px-0">
        <h1 className="text-2xl font-bold mb-6 max-sm:px-2">Đặt hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2 max-sm:order-2">
            {isLoading ? (
              Array(items.length || 3)
                .fill(0)
                .map((_, index) => <CartItemSkeleton key={index} />)
            ) : !products?.length ? (
              <EmptyCart />
            ) : (
              items.map((item, index) => {
                const product = products.find((p) => p.kvId === item.productId);
                if (!product) return null;
                return (
                  <CartProductItem
                    className="border-none bg-[var(--light-beige)]"
                    key={item.productId + index}
                    product={product}
                    isEditable={false}
                    shoesCareProducts={product.addons || []}
                    vouchers={product.vouchers || []}
                    voucherAppliedProducts={product.appliedProducts || []}
                    item={item}
                    items={items}
                  />
                );
              })
            )}

            <div className="space-y-2 bg-[var(--light-beige)] p-2 sm:p-4">
              <Separator />
              <LineInfo
                title={
                  <div className="flex items-center gap-2 mt-2">
                    <Truck fill="#15374E" />
                    <span>Phí vận chuyển</span>
                  </div>
                }
                value={
                  isLoadingPrice ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin text-[var(--brown-brand)]"
                    />
                  ) : (
                    formatCurrency(SHIPPING_FEE_DEFAULT)
                  )
                }
              />
              <Separator />
              <LineInfo
                title={<span className="font-bold">Tổng tiền hàng</span>}
                value={
                  isLoadingPrice ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin text-[var(--brown-brand)]"
                    />
                  ) : (
                    <span className="text-[var(--red-brand)] font-bold">
                      {formatCurrency(totalSalePrice)}
                    </span>
                  )
                }
              />
              <LineInfo
                title="Tiết kiệm"
                value={
                  isLoadingPrice ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin text-[var(--brown-brand)]"
                    />
                  ) : (
                    <span className="text-[var(--red-brand)]">
                      {formatCurrency(saved)}
                    </span>
                  )
                }
              />
            </div>

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
                      className="animate-spin text-[var(--brown-brand)]"
                    />
                  ) : (
                    <span className="text-[var(--red-brand)] font-bold">
                      {formatCurrency(finalPrice)}
                    </span>
                  )
                }
              />
            </div>

            <div className="hidden z-[51] bg-[var(--light-beige)]  w-full sm:grid grid-cols-9 gap-4 mt-4 p-4">
              <div className="col-span-3 " />
              <div className="col-span-6 grid grid-cols-8 gap-4">
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
                        {formatCurrency(finalPrice || 0)}
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
                      disabled={!totalSelected || isSubmitting}
                      className="col-span-2 rounded-none bg-[var(--red-brand)] text-white "
                      onClick={form.handleSubmit}
                    >
                      {isSubmitting ? "Đang xử lý..." : "Mua hàng"}
                    </Button>
                  )}
                />
              </div>
            </div>
            <RenderHTMLFromCMS
              html={(configs?.["DELIVERY_POLICY"] as string) || ""}
              className="p-2 sm:p-4 mt-4"
            />
          </div>

          <OrderInfo
            form={form}
            vouchers={vouchers || []}
            className="block max-sm:order-1"
          />
        </div>
      </div>
      <MobileActionBar
        items={items}
        totalSelected={totalSelected}
        toggleSelectAll={toggleSelectAll}
        finalPrice={finalPrice}
        totalSaved={totalSaved}
        onSubmit={form.handleSubmit}
        isLoading={isLoadingPrice}
        vouchers={vouchers || []}
      />
    </div>
  );
}

export default PurchasePage;
