"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface OrderDetails {
  orderId: string;
  status: string;
  estimatedDelivery: string;
  shippingAddress: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  trackingNumber: string;
  trackingEvents: Array<{
    date: string;
    time: string;
    status: string;
    location: string;
  }>;
}

export default function OrderTrackingClient({
  orderDetails,
}: {
  orderDetails: OrderDetails;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusSteps = [
    { icon: Package, label: "Đã xác nhận", status: "processing" },
    { icon: Truck, label: "Đang giao hàng", status: "shipping" },
    { icon: CheckCircle, label: "Đã giao hàng", status: "delivered" },
  ];

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.status === orderDetails.status
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Theo dõi đơn hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Status */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Trạng thái đơn hàng</h2>
            <div className="flex justify-between items-center">
              {statusSteps.map((step, index) => (
                <div key={step.status} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      index <= currentStepIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm mt-2 text-center">{step.label}</span>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`h-1 w-full ${
                        index < currentStepIndex ? "bg-primary" : "bg-muted"
                      } mt-2`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Chi tiết đơn hàng</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Mã đơn hàng:</span>{" "}
                {orderDetails.orderId}
              </div>
              <div>
                <span className="font-medium">Ngày giao hàng dự kiến:</span>{" "}
                {orderDetails.estimatedDelivery}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Địa chỉ giao hàng:</span>{" "}
                {orderDetails.shippingAddress}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="items">
              <AccordionTrigger>
                Danh sách sản phẩm ({orderDetails.items.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {orderDetails.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>{item.price.toLocaleString("vi-VN")} đ</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center font-medium">
                    <span>Tổng cộng</span>
                    <span>{orderDetails.total.toLocaleString("vi-VN")} đ</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Tracking Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Thông tin vận chuyển</h2>
            <div className="text-sm">
              <span className="font-medium">Mã vận đơn:</span>{" "}
              {orderDetails.trackingNumber}
            </div>
            <div className="space-y-2">
              {orderDetails.trackingEvents
                .slice(0, isExpanded ? undefined : 3)
                .map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-1/4">
                      <div>{event.date}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.time}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div>{event.status}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.location}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            {orderDetails.trackingEvents.length > 3 && (
              <Button
                variant="link"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center"
              >
                {isExpanded ? (
                  <>
                    Thu gọn <ChevronUp className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Xem thêm <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/">Quay lại trang chủ</Link>
          </Button>
          <Button asChild>
            <Link href="/contact">Liên hệ hỗ trợ</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
