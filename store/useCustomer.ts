import { Customer } from "@/types/customer";
import { create } from "zustand";

type CustomerStore = {
  customer: Customer | null;
  userId: string | null; // for case anonymous user
};

export const useCustomerStore = create<CustomerStore>((set) => ({
  customer: null,
  userId: null,
}));
