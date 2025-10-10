"use client";

import {
  DistrictSelector,
  WardSelector,
} from "@/app/(admin)/admin/orders/order-filter";
import { APIStatus } from "@/client/callAPI";
import { getProvinces } from "@/client/master-data.client";
import { AutoComplete } from "@/components/ui/auto-complete";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCart";
import { useCustomerStore } from "@/store/useCustomer";
import { TOrderInfo } from "@/types/cart";
import { Voucher } from "@/types/voucher";
import { escapeHtml } from "@/utils";
import { debounce } from "@/utils/debounce";
import "@fontsource/road-rage/latin.css";
import {
  FormAsyncValidateOrFn,
  FormValidateOrFn,
  ReactFormExtendedApi,
} from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import VoucherCard from "../home-page/voucher-zone/voucher-card";

function OrderInfo({
  form,
  className,
  vouchers,
}: {
  className?: string;
  form: ReactFormExtendedApi<
    TOrderInfo,
    FormValidateOrFn<TOrderInfo> | undefined,
    FormValidateOrFn<TOrderInfo> | undefined,
    FormAsyncValidateOrFn<TOrderInfo> | undefined,
    FormValidateOrFn<TOrderInfo> | undefined,
    FormAsyncValidateOrFn<TOrderInfo> | undefined,
    FormValidateOrFn<TOrderInfo> | undefined,
    FormAsyncValidateOrFn<TOrderInfo> | undefined,
    FormValidateOrFn<TOrderInfo> | undefined,
    FormAsyncValidateOrFn<TOrderInfo> | undefined,
    FormAsyncValidateOrFn<TOrderInfo> | undefined,
    unknown
  >;
  vouchers: Voucher[];
}) {
  const { data: provinces, isLoading } = useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const res = await getProvinces();
      if (res.status !== APIStatus.OK || !res.data) return [];
      return res.data.map((p) => ({
        value: p.ProvinceID,
        label: p.ProvinceName,
      }));
    },
  });

  const updatePhoneNumber = useCallback(
    debounce((phoneNumber: string) => {
      useCartStore.setState({
        info: {
          ...useCartStore.getState().info,
          phoneNumber,
        },
      });
    }, 300),
    []
  );
  console.log("vouchers", vouchers);
  return (
    <div
      className={cn(
        "hidden sm:block col-span-1 bg-[var(--light-beige)]",
        className
      )}
    >
      <div className="px-2 py-4 sm:p-4 sm:sticky top-4">
        <h2 className="text-base sm:text-lg font-bold mb-4">
          Thông tin mua hàng
        </h2>
        <div className="mt-6 pt-4 border-t max-sm:hidden">
          <div className="p-4 px-8  bg-[url('/icons/voucher-bg.svg')] bg-no-repeat bg-[var(--red-brand)]">
            <div className="flex gap-2 items-center mb-4">
              <h2 className="text-3xl sm:text-[calc(3rem+2px)] font-bold text-white  font-road-rage ">
                Voucher liên kết
              </h2>
              <Image
                src="/icons/r8ckie_white_logo.svg"
                alt="r8ckie_white_logo"
                width={113}
                height={38}
              />
            </div>
            <form.Field name="phoneNumber">
              {(field) => (
                <div className="relative">
                  <Input
                    placeholder="Nhập số điện thoại để hiển thị voucher"
                    defaultValue={field.state.value}
                    onChange={(e) => {
                      updatePhoneNumber(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = (e.target as HTMLInputElement).value;
                        field.handleChange(escapeHtml(value));

                        useCartStore.setState({
                          userSelectedVouchers: [],
                          ignoreVouchers: [],
                          info: {
                            ...useCartStore.getState().info,
                            phoneNumber: field.state.value,
                          },
                        });
                      }
                    }}
                    onBlur={(e) => {
                      field.handleChange(escapeHtml(e.target.value));
                      useCartStore.setState({
                        userSelectedVouchers: [],
                        ignoreVouchers: [],
                      });
                    }}
                    className="rounded-none"
                  />
                  <Search className="absolute top-1/2 right-2 -translate-y-1/2" />
                </div>
              )}
            </form.Field>

            {!!vouchers?.length && (
              <ScrollArea
                className="flex h-[300px] mt-2 "
                viewportClassName="p-0"
              >
                {vouchers.map((voucher, index) => (
                  <VoucherCard
                    voucher={voucher}
                    className="my-2 w-full"
                    key={index}
                    customer={useCustomerStore.getState().customer}
                  />
                ))}
              </ScrollArea>
            )}
          </div>
        </div>
        <div className="space-y-3 mt-3">
          <form.Field name="fullName">
            {(field) => (
              <div>
                <Input
                  placeholder="Họ và tên"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(escapeHtml(e.target.value))
                  }
                />
                {(field.state.meta.errors?.[0] as any)?.message && (
                  <p className="text-red-500 text-xs mt-1">
                    {(field.state.meta.errors[0] as any)?.message}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="phoneNumber">
            {(field) => (
              <div>
                <Input
                  placeholder="Số điện thoại"
                  defaultValue={field.state.value}
                  onChange={(e) => {
                    updatePhoneNumber(e.target.value);
                  }}
                  onBlur={(e) => {
                    field.handleChange(escapeHtml(e.target.value));
                    useCartStore.setState({
                      userSelectedVouchers: [],
                      ignoreVouchers: [],
                      info: {
                        ...useCartStore.getState().info,
                        phoneNumber: field.state.value,
                      },
                    });
                  }}
                />
                {(field.state.meta.errors?.[0] as any)?.message && (
                  <p className="text-red-500 text-xs mt-1">
                    {(field.state.meta.errors[0] as any)?.message}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="provinceCode"
            children={(field) => {
              return (
                <>
                  <AutoComplete
                    value={
                      provinces?.filter(
                        (p) => p.value === +field.state.value
                      )[0]
                    }
                    options={provinces ?? []}
                    isLoading={isLoading}
                    placeholder="Chọn Tỉnh/Thành phố"
                    onChange={(v) => {
                      field.handleChange(v?.value || 0);
                      form.setFieldValue("districtCode", 0);
                      form.setFieldValue("wardCode", 0);
                      useCartStore.setState({
                        info: {
                          ...useCartStore.getState().info,
                          provinceCode: v?.value || 0,
                        },
                      });
                    }}
                  />

                  {(field.state.meta.errors?.[0] as any)?.message && (
                    <p className="text-red-500 text-xs mt-1">
                      {(field.state.meta.errors[0] as any)?.message}
                    </p>
                  )}
                </>
              );
            }}
          />

          <form.Field
            name="districtCode"
            children={(field) => (
              <>
                <form.Field
                  name="provinceCode"
                  children={(provinceCode) => (
                    <DistrictSelector
                      provinceCode={+provinceCode.state.value}
                      value={+field.state.value}
                      onChange={(v) => {
                        field.handleChange(v.value);
                        form.setFieldValue("wardCode", 0);
                        useCartStore.setState({
                          info: {
                            ...useCartStore.getState().info,
                            districtCode: v.value || 0,
                          },
                        });
                      }}
                    />
                  )}
                />
                {(field.state.meta.errors?.[0] as any)?.message && (
                  <p className="text-red-500 text-xs mt-1">
                    {(field.state.meta.errors[0] as any)?.message}
                  </p>
                )}
              </>
            )}
          />

          <form.Field
            name="wardCode"
            children={(field) => (
              <form.Field
                name="districtCode"
                children={(districtField) => (
                  <>
                    <WardSelector
                      districtCode={+districtField.state.value}
                      value={field.state.value.toString()}
                      onChange={(v) => {
                        field.handleChange(+v.value || 0);
                      }}
                    />
                    {(field.state.meta.errors?.[0] as any)?.message && (
                      <p className="text-red-500 text-xs mt-1">
                        {(field.state.meta.errors[0] as any)?.message}
                      </p>
                    )}
                  </>
                )}
              />
            )}
          />

          <form.Field name="address">
            {(field) => (
              <div>
                <Input
                  placeholder="Địa chỉ"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(escapeHtml(e.target.value))
                  }
                />
                {(field.state.meta.errors?.[0] as any)?.message && (
                  <p className="text-red-500 text-xs mt-1">
                    {(field.state.meta.errors[0] as any)?.message}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="note">
            {(field) => (
              <div>
                <AutosizeTextarea
                  minHeight={120}
                  placeholder="Ghi chú đơn hàng..."
                  className="w-full p-2 border rounded-md"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(escapeHtml(e.target.value))
                  }
                />
              </div>
            )}
          </form.Field>
        </div>
      </div>
    </div>
  );
}

export default OrderInfo;
