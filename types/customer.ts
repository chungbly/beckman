export enum Tier {
  NEW = "NEW",
  MEMBER = "MEMBER",
  VIP = "VIP",
}
export interface Customer {
  _id: string;
  code: string;
  name: string;
  phoneNumbers: string[];
  birthday?: string;
  tier: Tier;
  voucherCodes: string[];
  deletedAt: string;
  updatedAt: string;
  createdAt: string;
}
