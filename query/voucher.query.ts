import { APIStatus } from "@/client/callAPI";
import { getVouchers } from "@/client/voucher.client";

export const getAllAvailabeCoupon = {
  queryKey: ["get-coupons"],
  queryFn: async () => {
    const res = await getVouchers({
      isActive: true,
      isCoupon: true,
      isAvailabe: true,
    });
    if (res.status !== APIStatus.OK || !res.data || !res.data?.length)
      return [];
    return res.data;
  },
};

const getUserVouchers = async (userId: string) => {
  if (!userId) return [];
  const res = await getVouchers(
    {
      isActive: true,
      customerId: userId,
      isAvailabe: true,
    },
    100,
    1,
    false
  );
  const vouchers = res?.data || [];
  return vouchers;
};

const getCoupons = async () => {
  const res = await getVouchers(
    {
      isActive: true,
      isCoupon: true,
      isAvailabe: true,
    },
    100,
    1,
    false
  );
  const coupons = res?.data || [];
  return coupons;
};

export const getCouponsQuery = () => {
  return {
    queryKey: ["get-coupons"],
    queryFn: () => {
      return getCoupons();
    },
  };
};

export const getUserVouchersQuery = (userId: string) => {
  return {
    queryKey: ["get-user-vouchers", userId],
    queryFn: () => {
      if (!userId) return [];
      return getUserVouchers(userId);
    },
  };
};
