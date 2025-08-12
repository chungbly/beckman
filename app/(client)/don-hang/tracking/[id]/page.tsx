import { Metadata } from "next";
import OrderTrackingClient from "./order-tracking";

export const metadata: Metadata = {
  title: "Theo dõi đơn hàng | Beckman",
  description: "Theo dõi trạng thái và thông tin chi tiết đơn hàng của bạn.",
};

async function getOrderDetails(orderId: string) {
  // In a real application, this would be an API call or database query
  return {
    orderId: "R8-12345",
    status: "shipping",
    estimatedDelivery: "28/12/2023",
    shippingAddress: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    items: [
      { name: "Giày Derby Classic", quantity: 1, price: 1150000 },
      { name: "Ví da", quantity: 1, price: 850000 },
    ],
    total: 2000000,
    trackingNumber: "VN123456789",
    trackingEvents: [
      {
        date: "25/12/2023",
        time: "09:00",
        status: "Đơn hàng đã được xác nhận",
        location: "TP.HCM",
      },
      {
        date: "26/12/2023",
        time: "14:30",
        status: "Đơn hàng đang được chuẩn bị",
        location: "TP.HCM",
      },
      {
        date: "27/12/2023",
        time: "08:45",
        status: "Đơn hàng đã được giao cho đơn vị vận chuyển",
        location: "TP.HCM",
      },
    ],
  };
}

export default async function OrderTrackingPage(props: {
  searchParams: Promise<{ orderId: string }>;
}) {
  const searchParams = await props.searchParams;
  const orderId = searchParams.orderId || "R8-12345"; // Default order ID if not provided
  const orderDetails = await getOrderDetails(orderId);

  return <OrderTrackingClient orderDetails={orderDetails} />;
}
