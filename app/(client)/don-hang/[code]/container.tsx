"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Order } from "@/types/order";
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/number";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Package, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function OrderCompletePageContainer({
  order,
}: {
  order: Order;
}) {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const items = [] as (Product & {
    quantity: number;
  })[];
  order.items.forEach((item) => {
    const { addons, appliedProducts, ...rest } = item;
    if (addons.length) {
      addons.forEach((addon) => {
        items.push(addon);
      });
    }
    if (appliedProducts.length) {
      appliedProducts.forEach((appliedProduct) => {
        items.push(appliedProduct);
      });
    }
    items.push(rest);
  });
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <CardTitle className="text-center text-2xl font-bold">
            Cảm ơn bạn đã đặt hàng!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Đơn hàng của bạn đã được xác nhận và đang được xử lý. Xin cảm ơn bạn
            đã đặt hàng.
          </p>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Mã đơn hàng:</span>
              <span className="text-primary">{order.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tổng cộng:</span>
              <span className="font-bold text-[var(--red-brand)]">
                {formatCurrency(order.finalPrice)}
              </span>
            </div>
            {/* <div className="flex justify-between">
              <span className="font-medium">Thời gian giao hàng dự kiến:</span>
              <span>{orderDetails.estimatedDelivery}</span>
            </div> */}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Chi tiết đơn hàng</h3>
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground ml-2">
                    x{item.quantity}
                  </span>
                </div>
                <span className="font-bold text-[var(--red-brand)]">
                  {formatCurrency(item.finalPrice)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-8 py-4">
            <div className="flex flex-col items-center">
              <Package className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Đóng gói</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Vận chuyển</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Giao hàng</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {/* <Button asChild className="w-full">
            <Link href="/order-tracking">
              Theo dõi đơn hàng
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button> */}
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              Tiếp tục mua sắm
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
