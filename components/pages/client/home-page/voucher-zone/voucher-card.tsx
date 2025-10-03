"use client";
import { APIStatus } from "@/client/callAPI";
import { updateCart } from "@/client/cart.client";
import { addVoucherToCustomer } from "@/client/customer.client";
import { buildCart } from "@/client/order.client";
import { useToast } from "@/hooks/use-toast";
import { getUserId } from "@/lib/cookies";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCart";
import useStore from "@/store/useStore";
import { Customer } from "@/types/customer";
import { CartBuilderRes } from "@/types/order";
import { Voucher } from "@/types/voucher";
import { Ticket, Truck } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast as sonner } from "sonner";

// Lazy load LoginDialog component
const LoginDialog = dynamic(
  () => import("@/components/app-layout/login-form-dialog"),
  { ssr: false }
);

// Types
type VoucherCardProps = {
  voucher: Voucher;
  className?: string;
  customer?: Customer | null;
};

// UI Components
const VoucherContent = ({
  name,
  description,
}: {
  name: string;
  description: string;
}) => (
  <div className="flex-1 bg-[#dcc7b6] flex flex-col justify-start p-3 py-1">
    <h3 className="font-bold text-sm">{name}</h3>
    <p className="text-sm line-clamp-2 overflow-ellipsis">{description}</p>
  </div>
);

const VoucherAction = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div
    className={cn(
      "w-[80px] min-w-[80px] aspect-square h-full cursor-pointer flex flex-col items-center justify-center text-[#8B1F18] font-bold text-sm bg-white",
      className
    )}
    onClick={onClick}
  >
    {children}
  </div>
);

const AppliedStatus = ({ onClick }: { onClick?: () => void }) => (
  <>
    <span onClick={onClick}>ĐÃ</span>
    <span onClick={onClick}>ÁP DỤNG</span>
  </>
);

const NotAppliedStatus = ({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) => (
  <div
    className={cn("flex flex-col justify-center items-center", className)}
    onClick={onClick}
  >
    <span>CHƯA</span>
    <span>ÁP DỤNG</span>
  </div>
);

const Received = () => (
  <div className="flex flex-col justify-center items-center">
    <span>ĐÃ</span>
    <span>NHẬN</span>
  </div>
);

const ClaimButton = ({ onClick }: { onClick: () => void }) => (
  <div onClick={onClick} className="flex flex-col justify-center items-center">
    <span>NHẬN</span>
    <span>NGAY</span>
  </div>
);

const LoginButton = ({ onClick }: { onClick?: () => void }) => (
  <div
    className="flex flex-col items-center justify-center text-[#8B1F18] font-bold text-sm"
    onClick={onClick}
  >
    <span>ĐĂNG</span>
    <span>NHẬP</span>
  </div>
);

// Main Component
export default function VoucherCard({
  className,
  voucher,
  customer,
}: VoucherCardProps) {
  const { toast } = useToast();
  const params = useParams();
  const pathname = usePathname();

  // Get voucher state from store
  const voucherCodes =
    useStore(useCartStore, (s) => s.userSelectedVouchers) || [];
  const appliedVouchers =
    useStore(useCartStore, (s) => s.appliedVouchers) || [];

  // Derived state
  const allowApplyVoucher = ["/gio-hang", "/dat-hang"].includes(pathname);
  const isSelected = appliedVouchers.includes(voucher.code);
  const isFreeshipping = voucher.discount.type === "free-shipping";
  const [isCustomerOwned, setIsCustomerOwned] = useState(
    customer?.voucherCodes?.includes(voucher.code)
  );

  // Apply voucher handler
  const handleApplyVoucher = useCallback(
    async (voucher: Voucher) => {
      // khoong thao tác coupon hoặc voucher private vì đây là loại áp dụng tự động
      if (isSelected) return;
      const items = useCartStore.getState().items;
      const provinceCode = useCartStore.getState().info.provinceCode;
      const newUserSelectedVouchers = Array.from(
        new Set([...voucherCodes, voucher.code])
      );
      const res = await buildCart(
        items.map((i) => ({
          productId: i.productId,
          quantity: i.isSelected ? i.quantity : 0,
          addons: i.addons || [],
        })),
        newUserSelectedVouchers,
        [],
        provinceCode
      );
      if (res.status !== APIStatus.OK || !res.data) return {} as CartBuilderRes;
      const appliedVouchers = res.data.appliedVoucherCodes || [];
      if (!appliedVouchers.includes(voucher.code)) {
        return toast({
          title: "Không thể áp dụng voucher",
          description: "Giỏ hàng không thể áp dụng voucher này",
          variant: "error",
        });
      }

      // Update cart on server
      const userId = await getUserId();
      await updateCart(userId, {
        items: useCartStore.getState().items,
        userSelectedVouchers: newUserSelectedVouchers,
        shippingInfo: useCartStore.getState().info,
        ignoreVouchers: useCartStore.getState().ignoreVouchers,
      });
      // Update applied vouchers state
      useCartStore.setState({
        appliedVouchers: appliedVouchers,
        userSelectedVouchers: newUserSelectedVouchers,
      });
    },
    [isSelected, voucherCodes, toast]
  );

  // Add voucher to customer account
  const handleAddVoucher = async (voucher: Voucher) => {
    if (!customer || !customer?.phoneNumbers?.[0] || isCustomerOwned) return;

    const res = await addVoucherToCustomer(customer._id, [voucher.code]);

    if (res.status !== APIStatus.OK) {
      return toast({
        title: "Đã có lỗi xảy ra",
        description: res.message,
        variant: "error",
      });
    }

    sonner.custom((t) => (
      <div className="bg-white flex items-center gap-2 border border-[#15374E] rounded-lg text-xs py-[10px] px-[20px]">
        {isFreeshipping ? (
          <Truck className="text-[#15374E] min-w-max />" />
        ) : (
          <Ticket className="-rotate-45 text-[#15374E] min-w-max" />
        )}
        <div className="space-y-2">
          <p className="font-bold">Thông báo</p>
          <p>
            {isFreeshipping
              ? "Nhận voucher Freeship thành công, Voucher sẽ tự động kích hoạt khi giỏ hàng thoả điều kiện"
              : `Nhận voucher ${voucher.code} thành công`}
          </p>
        </div>
      </div>
    ));
    // Update local state
    setIsCustomerOwned(true);
  };

  // Render voucher action button based on state
  const renderVoucherAction = () => {
    if (!customer) {
      return (
        <LoginDialog voucher={voucher}>
          <LoginButton />
        </LoginDialog>
      );
    }
    // On cart or checkout page
    if (allowApplyVoucher) {
      if (isCustomerOwned || voucher.isCoupon) {
        if (isSelected) {
          return <AppliedStatus onClick={() => handleApplyVoucher(voucher)} />;
        }
        return (
          <NotAppliedStatus
            className={
              voucher.discount?.type === "free-shipping"
                ? "opacity-50 pointer-events-none"
                : ""
            }
            onClick={() => handleApplyVoucher(voucher)}
          />
        );
      }
      return <ClaimButton onClick={() => handleAddVoucher(voucher)} />;
    }
    if (isCustomerOwned || voucher.isCoupon) {
      if (!!params.productSlug) {
        if (!isSelected) {
          return <Received />;
        }
        return <AppliedStatus onClick={() => handleApplyVoucher(voucher)} />;
      }
      return <Ticket className="min-w-8 min-h-8" />;
    } else {
      return <ClaimButton onClick={() => handleAddVoucher(voucher)} />;
    }
  };
  // Register global apply voucher function
  useEffect(() => {
    if (!handleApplyVoucher || window.applyVoucher) return;

    window.applyVoucher = (voucherCode: string) =>
      handleApplyVoucher({ code: voucherCode } as Voucher);

    return () => {
      delete window.applyVoucher;
    };
  }, [handleApplyVoucher]);

  useEffect(() => {
    if (!customer) return;
    setIsCustomerOwned(customer.voucherCodes?.includes(voucher.code) || false);
  }, [customer, voucher.code]);
  return (
    <div
      className={cn(
        "voucher-card relative w-[320px] h-[80px] transition-all hover:scale-[1.01]",
        className
      )}
    >
      <div className="w-full h-full flex">
        <VoucherContent name={voucher.name} description={voucher.description} />

        <div className="relative">
          <div
            className={cn(
              "absolute inset-y-0 -left-[1px] border-l border-dashed border-[#8B1F18]",
              isFreeshipping && customer ? "border-[rgb(21,55,78)]" : ""
            )}
          />
          <VoucherAction>{renderVoucherAction()}</VoucherAction>
        </div>
      </div>
    </div>
  );
}
