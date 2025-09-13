"use client";
import { APIStatus } from "@/client/callAPI";
import { updateCustomer } from "@/client/customer.client";
import { calculatePrices } from "@/client/order.client";
// import LoginDialog from "@/components/app-layout/login-form-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCart";
import useStore from "@/store/useStore";
import { Customer } from "@/types/customer";
import { Voucher } from "@/types/voucher";
import { useQueryClient } from "@tanstack/react-query";
import { Truck } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams, usePathname } from "next/navigation";
import { useId } from "react";

const LoginDialog = dynamic(
  () => import("@/components/app-layout/login-form-dialog"),
  {
    ssr: false,
  }
);

export default function VoucherCard({
  className,
  voucher,
  customer,
}: {
  voucher: Voucher;
  className?: string;
  customer?: Customer | null;
}) {
  const id = useId();
  const { toast } = useToast();
  const params = useParams();
  const pathname = usePathname();
  const voucherCodes =
    useStore(useCartStore, (s) => s.userSelectedVouchers) || [];
  const autoAppliedVouchers =
    useStore(useCartStore, (s) => s.autoAppliedVouchers) || [];
  const queryClient = useQueryClient();

  const allowApplyVoucher =
    ["/gio-hang", "/dat-hang"].includes(pathname) || !!params.productSlug;
  const isSelected =
    allowApplyVoucher &&
    (voucherCodes.includes(voucher.code) ||
      autoAppliedVouchers.includes(voucher.code));

  const handleCheckVoucher = async (vouchers: string[]) => {
    const items = useCartStore.getState().items;
    const shippingInfo = useCartStore.getState().info;
    const { provinceCode } = shippingInfo;
    if (!items.length || items.every((i) => !i.isSelected)) {
      return {
        isValid: false,
        reason: "Chưa có sản phẩm nào trong giỏ hàng",
      };
    }
    const res = await calculatePrices(
      items.map((i) => ({
        productId: i.productId,
        quantity: i.isSelected ? i.quantity : 0,
        addons: i.addons || [],
      })),
      vouchers,
      provinceCode
    );
    if (res.status !== APIStatus.OK || !res.data)
      return {
        isValid: false,
        reason: res.message,
      };
    const { invalidVouchers } = res.data;
    const invalidVoucher = invalidVouchers.find((v) => v.code === voucher.code);
    if (invalidVoucher)
      return {
        isValid: false,
        reason: invalidVoucher.reason,
      };
    return {
      isValid: true,
      reason: "",
    };
  };

  const handleApplyVoucher = async (voucher: Voucher) => {
    if (!allowApplyVoucher) return;
    if (isSelected) {
      if (autoAppliedVouchers.includes(voucher.code)) {
        return;
      }
      useCartStore.setState({
        userSelectedVouchers: voucherCodes.filter((v) => v !== voucher.code),
      });
      return;
    }
    const { isValid, reason } = await handleCheckVoucher([
      ...voucherCodes,
      voucher.code,
    ]);
    if (!isValid) {
      return toast({
        title: "Voucher không hợp lệ",
        description: reason,
        variant: "error",
      });
    }
    useCartStore.setState({
      userSelectedVouchers: [...voucherCodes, voucher.code],
    });
  };

  const handleAddVoucher = async (voucher: Voucher) => {
    if (!customer || !customer?.phoneNumbers?.[0]) return;
    const res = await updateCustomer(customer._id, {
      voucherCodes: [...(customer.voucherCodes || []), voucher.code],
    });
    if (res.status !== APIStatus.OK) {
      return toast({
        title: "Đã có lỗi xảy ra",
        description: res.message,
        variant: "error",
      });
    }
    toast({
      title: "Đã thêm voucher",
      description: "Voucher đã được thêm vào danh sách voucher của bạn",
      variant: "success",
    });
    queryClient.invalidateQueries({
      queryKey: ["customer", customer._id],
    });
  };

  return (
    <div
      className={cn(
        "voucher-card relative w-[320px] h-[80px] transition-all hover:scale-[1.01]",
        className
      )}
    >
      <div className="w-full h-full flex">
        <div className="flex-1 bg-[#dcc7b6] flex flex-col justify-start p-3 py-1">
          <h3 className="font-bold text-sm">{voucher.name}</h3>
          <p className="text-sm line-clamp-2 overflow-ellipsis">
            {voucher.description}
          </p>
        </div>

        <div className="relative">
          <div
            className={cn(
              "absolute inset-y-0 -left-[1px] border-l border-dashed border-[#8B1F18]",
              voucher.discount.type === "free-shipping"
                ? "border-[rgb(21,55,78)]"
                : ""
            )}
          />
          <div
            className={cn(
              "w-[80px] min-w-[80px] aspect-square h-full cursor-pointer flex flex-col items-center justify-center text-[#8B1F18] font-bold text-sm",
              voucher.discount.type === "free-shipping"
                ? "bg-[#15374E] text-white"
                : "bg-white",
              autoAppliedVouchers.includes(voucher.code) && "cursor-not-allowed"
            )}
          >
            {voucher.discount.type === "free-shipping" ? (
              <div className="flex flex-col items-center justify-center">
                <Truck size={28} />
                <i>Freeship</i>
              </div>
            ) : allowApplyVoucher ? (
              isSelected ? (
                <>
                  <span>ĐÃ</span>
                  <span>ÁP DỤNG</span>
                </>
              ) : (
                <div
                  className="flex flex-col justify-center items-center"
                  onClick={() => {
                    handleApplyVoucher(voucher);
                  }}
                >
                  <span>ÁP</span>
                  <span>DỤNG</span>
                </div>
              )
            ) : customer ? (
              customer?.voucherCodes?.includes(voucher.code) ? (
                <div className="flex flex-col justify-center items-center">
                  <span>ĐÃ</span>
                  <span>NHẬN</span>
                </div>
              ) : (
                <div
                  onClick={() => handleAddVoucher(voucher)}
                  className="flex flex-col justify-center items-center"
                >
                  <span>NHẬN</span>
                  <span>NGAY</span>
                </div>
              )
            ) : (
              <LoginDialog voucher={voucher}>
                <div className="flex flex-col justify-center items-center">
                  <span>NHẬN</span>
                  <span>NGAY</span>
                </div>
              </LoginDialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
