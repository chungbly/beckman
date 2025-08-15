import { Meta } from "./api-response";

export type VoucherType = "percent" | "fixed-amount" | "free-shipping";

export interface Discount {
  type: VoucherType;
  value: number;
  maxDiscount?: number;
}

export interface AddOnDeal {
  productId: number;
  type: VoucherType;
  value: number;
  isAppliedToAllVariants: boolean;
}

export interface ConditionItem {
  categoryIds?: string[];
  productIds?: number[];
  minTotal?: number;
  deliveryLocation?: {
    provinceCodes: number[];
    minTotal?: number;
  };
  operator: "and" | "or"; // (categoryIds or productIds) OR minTotal, (categoryIds or productIds) AND minTotal
}

export interface ApplyOn
  extends Omit<ConditionItem, "operator" | "minTotal" | "deliveryLocation"> {
  addOnDeals?: AddOnDeal[];
}
export interface Voucher {
  _id: string;
  isCoupon: boolean;
  isActive: boolean;
  code: string;
  name: string;
  description: string;
  discount: Discount;
  condition: ConditionItem;
  applyOn: ApplyOn;
  validFrom: string;
  validTo: string;
  quantity: number;
  used: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}
export interface QueryGetVoucher {
  ids?: string[];
  codes?: string[];
  isActive?: boolean;
  isCoupon?: boolean;
  isAvailabe?: boolean;
  isUsed?: boolean;
  name?: string;
  type?: string;
  customerId?: string;
  phoneNumber?: string;
}

export interface VoucherWithMeta {
  items: Voucher[];
  meta: Meta;
}
