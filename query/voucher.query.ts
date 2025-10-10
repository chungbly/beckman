import { APIStatus } from "@/client/callAPI";
import { getVouchers } from "@/client/voucher.client";

export const getAllAvailabeCoupon = {
  queryKey: ["get-coupons"],
  queryFn: async () => {
    const res = await getVouchers({
      isActive: true,
      isCoupon: true,
      isAvailable: true,
    });
    if (res.status !== APIStatus.OK || !res.data || !res.data?.length)
      return [];
    return res.data;
  },
};

export const getUserVouchers = async ({
  userId,
  phoneNumber,
}: {
  userId?: string;
  phoneNumber?: string;
}) => {
  if (!userId && !phoneNumber) return [];
  const res = await getVouchers(
    {
      isActive: true,
      phoneNumber,
      customerId: userId,
      isAvailable: true,
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
      isAvailable: true,
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

export const getUserVouchersQuery = ({
  userId,
  phoneNumber,
}: {
  userId?: string;
  phoneNumber?: string;
}) => {
  return {
    queryKey: ["get-user-vouchers", userId, phoneNumber],
    queryFn: () => {
      if (!userId && !phoneNumber) return [];
      return getUserVouchers({ userId, phoneNumber });
    },
  };
};
