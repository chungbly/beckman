"use client";
import { updateCart } from "@/client/cart.client";
import { getBuiltCartQuery } from "@/query/cart.query";
import { useCartStore } from "@/store/useCart";
import { useCustomerStore } from "@/store/useCustomer";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function CartSyncer() {
  const { data } = useQuery(getBuiltCartQuery);
  const customer = useCustomerStore((state) => state.customer);

  useEffect(() => {
    if (!data) return;
    const { originalCart } = data;
    useCartStore.setState({
      items: originalCart?.items || [],
      info: originalCart?.shippingInfo || {
        fullName: customer?.name || "",
        phoneNumber: customer?.phoneNumbers?.[0] || "",
        provinceCode: 0,
        districtCode: 0,
        wardCode: 0,
        address: "",
        note: "",
      },
    });
  }, [data, customer]);

  useEffect(() => {
    const unsubscribe = useCartStore.subscribe(async (state) => {
      const customer = useCustomerStore.getState().customer;
      const customerId = customer?._id || useCustomerStore.getState().userId;
      if (!customerId) return;
      const { items, info } = state;
      updateCart(customerId, {
        items,
        shippingInfo: info,
      });
    });

    return () => unsubscribe();
  }, []);

  return null;
}
