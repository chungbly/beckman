import { getOrderByCode } from "@/client/order.client";
import { Metadata } from "next";
import OrderCompletePageContainer from "./container";
import OrderNotFound from "./not-found";

export const metadata: Metadata = {
  title: "Đặt hàng thành công",
};

export default async function OrderCompletePage(props: {
  params: Promise<{ code: string }>;
}) {
  const params = await props.params;
  const { code } = params;
  const res = await getOrderByCode(code);
  const order = res?.data;

  if (!order) {
    return <OrderNotFound />;
  }
  return <OrderCompletePageContainer order={order} />;
}
