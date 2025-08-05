import { cn } from "@/lib/utils";
import { Check, Package, Truck, XCircle } from "lucide-react";

export enum OrderStatus {
  WAIT_TO_PROCESS = "WAIT_TO_PROCESS",
  PROCESSING = "PROCESSING",
  DELIVERING = "DELIVERING",
  DELIVERED = "DELIVERED",
  DELIVERY_FAILED = "DELIVERY_FAILED",
  CANCEL = "CANCEL",
}

export const orderStages: {
  key: OrderStatus;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    key: OrderStatus.WAIT_TO_PROCESS,
    label: "Chờ xử lý",
    icon: <Package className="w-4 h-4" />,
  },
  {
    key: OrderStatus.PROCESSING,
    label: "Đang xử lý",
    icon: <Package className="w-4 h-4" />,
  },
  {
    key: OrderStatus.DELIVERING,
    label: "Đang giao hàng",
    icon: <Truck className="w-4 h-4" />,
  },
  {
    key: OrderStatus.DELIVERED,
    label: "Đã giao hàng",
    icon: <Check className="w-4 h-4" />,
  },
  {
    key: OrderStatus.DELIVERY_FAILED,
    label: "Giao hàng thất bại",
    icon: <XCircle className="w-4 h-4" />,
  },
  {
    key: OrderStatus.CANCEL,
    label: "Đã hủy",
    icon: <XCircle className="w-4 h-4" />,
  },
];
interface OrderTimelineProps {
  status: OrderStatus;
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  const currentStageIndex = orderStages.findIndex(
    (stage) => stage.key === status
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Trạng thái đơn hàng</h3>
      <div
        className={cn(
          "relative grid grid-cols-6",
          status === OrderStatus.DELIVERY_FAILED ? "grid-cols-5" : ""
        )}
      >
        {orderStages.map((stage, index) => {
          if (status === OrderStatus.DELIVERY_FAILED && index === 3) return;
          return (
            <div
              key={stage.key}
              className="relative col-span-1 flex flex-col justify-center items-center mb-4"
            >
              <div className="relative w-full flex justify-center">
                {index < orderStages.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-1/2 top-1/2 w-full h-[2px] bg-gray-200",
                      index < currentStageIndex && status !== OrderStatus.CANCEL
                        ? "bg-primary"
                        : "bg-gray-200"
                    )}
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    index <= currentStageIndex && status !== OrderStatus.CANCEL
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-200 text-gray-400"
                  } ${
                    (status === OrderStatus.DELIVERY_FAILED && index === 4) ||
                    (status === OrderStatus.CANCEL && index === 5)
                      ? "bg-red-500 text-white"
                      : ""
                  }`}
                >
                  {stage.icon}
                </div>
              </div>
              <p
                className={`hidden sm:block font-medium ${
                  index <= currentStageIndex && status !== OrderStatus.CANCEL
                    ? "text-primary"
                    : "text-gray-500"
                } ${
                  (status === OrderStatus.DELIVERY_FAILED && index === 4) ||
                  (status === OrderStatus.CANCEL && index === 5)
                    ? "text-red-500"
                    : ""
                }`}
              >
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
