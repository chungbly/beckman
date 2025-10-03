import { Product } from "./product";
import { Voucher } from "./voucher";

export interface Order {
  _id: string;
  deletedAt: any;
  code: string;
  customerId: string;
  shippingInfo: ShippingInfo;
  status: string;
  items: Item[];
  totalPrice: number;
  totalSalePrice: number;
  shippingFee: number;
  voucherCodes: string[];
  discount: number;
  finalPrice: number;
  saved: number;
  totalSaved: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

interface Item extends Product {
  quantity: number;
  addons: (Product & {
    quantity: number;
  })[];
  vouchers: Voucher[];
  appliedProducts: (Product & {
    quantity: number;
    discount: number;
    voucherCode: string;
  })[];
  isRated: boolean;
}

export interface ShippingInfo {
  wardCode: number;
  districtCode: number;
  provinceCode: number;
  fullName: string;
  phoneNumber: string;
  address: string;
}

export interface CalculateOrderRes {
  totalPrice: number;
  finalPrice: number;
  shippingFee: number;
  discount: number;
  discountedProducts: Array<{
    productId: number;
    quantity: number;
    discountAmount: number;
  }>;
  invalidVouchers: {
    code: string;
    reason: string;
  }[];
}

export interface CartBuilderItem extends Product {
  quantity: number;
  totalPrice: number;
  addons: (Product & {
    quantity: number;
  })[];
  couponsEligible: Voucher[];
  appliedProducts: (Product & {
    quantity: number;
    discount: number;
    voucherCode: string;
  })[];
  vouchersApplied: string[];
}
export interface CartBuilderRes {
  cart: CartBuilderItem[];
  totalPrice: number;
  totalSalePrice: number;
  saved: number;
  totalSaved: number;
  finalPrice: number;
  shippingFee: number;
  discount: number;
  cartFixedDiscount: number;
  appliedVoucherCodes: string[];
  invalidVouchers: {
    code: string;
    reason: string;
  }[];
}

export interface CreateOrderData {
  shippingInfo: ShippingInfo;
  items: {
    productId: number;
    quantity: number;
    addons: number[];
  }[];
  voucherCode?: string;
  customerId?: string;
}
