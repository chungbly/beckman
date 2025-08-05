import { Meta } from "@/types/api-response";
import { Customer } from "@/types/customer";
import { callAPI } from "./callAPI";

export interface CustomerWithMeta {
  items: Customer[];
  meta: Meta;
}

type TypeQuery = true | false;

type ObjectType<T> = T extends true
  ? CustomerWithMeta
  : T extends false
  ? Customer[]
  : never;
export type GetCustomerQuery = {
  ids?: string[];
  codes?: string[];
  code?: string;
  name?: string;
  tier?: string;
  phoneNumbers?: string[];
  phoneNumber?: string;
};
export const getCustomers = async <T extends TypeQuery = false>(
  query: Partial<GetCustomerQuery>,
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  return await callAPI<ObjectType<T>>(`/api/customers`, {
    query: {
      q: JSON.stringify(query),
      limit,
      page,
      getTotal,
    },
  });
};

export const getCustomer = async (id: string) => {
  return await callAPI<Customer>(`/api/customers/${id}`);
};

export const createCustomer = async (customer: Partial<Customer>) => {
  return await callAPI<Customer>(`/api/customers/create`, {
    method: "POST",
    body: JSON.stringify(customer),
  });
};

export const bulkCreateCustomers = async (customers: Partial<Customer>[]) => {
  return await callAPI<Customer[]>(`/api/customers/bulk-create`, {
    method: "POST",
    body: JSON.stringify(customers),
  });
};

export const updateCustomer = async (
  id: string,
  customer: Partial<Customer>
) => {
  return await callAPI<Customer>(`/api/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(customer),
  });
};
