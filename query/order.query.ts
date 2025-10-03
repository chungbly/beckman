import { APIStatus } from "@/client/callAPI";
import { buildCart } from "@/client/order.client";
import { CartItem } from "@/store/useCart";
import { CartBuilderRes } from "@/types/order";
import { keepPreviousData } from "@tanstack/react-query";

export const buildCartQuery = (
  items: CartItem[],
  voucherCodes: string[] = [],
  ignoreVoucherCodes: string[] = [],
  provinceCode: number = 0,
  phoneNumber: string = ""
) => {
  return {
    queryKey: [
      "build-cart",
      items,
      voucherCodes,
      ignoreVoucherCodes,
      provinceCode,
      phoneNumber,
    ],
    queryFn: async () => {
      if (!items.length) return {} as CartBuilderRes;
      const res = await buildCart(
        items.map((i) => ({
          productId: i.productId,
          quantity: i.isSelected ? i.quantity : 0,
          addons: i.addons || [],
        })),
        voucherCodes,
        ignoreVoucherCodes,
        provinceCode,
        phoneNumber
      );
      if (res.status !== APIStatus.OK || !res.data) return {} as CartBuilderRes;
      return res.data;
    },
    placeholderData: keepPreviousData,
  };
};