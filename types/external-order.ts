import { Product } from "./product";

export interface ExternalOrder {
  _id: string;
  code: string;
  customerCode: string;
  items: (Product & {
    quantity: number;
    isRated?: boolean;
  })[];
  totalPrice: number;
  finalPrice: number;
  discount: number;
}

export interface ExternalOrderDto extends Omit<ExternalOrder, "_id" | "items"> {
  items: {
    productCode: string;
    quantity: number;
    basePrice: number;
    salePrice: number;
  }[];
}

export interface ExternalOrderQuery {
  codes?: string[];
  customerCodes?: string[];
  customerIds?: string[];
}
