import { getCustomer } from "@/client/customer.client";

const getUser = async (userId: string) => {
  const res = userId ? await getCustomer(userId) : null;
  const customer = res?.data;
  if (!customer) return null;
  return customer;
};

export const getCustomerQuery = (userId: string) => {
  return {
    queryKey: ["customer", userId],
    queryFn: () => {
      return getUser(userId);
    },
  };
};
