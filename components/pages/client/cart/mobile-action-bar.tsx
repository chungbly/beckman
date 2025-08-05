import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItem } from "@/store/useCart";
import { Voucher } from "@/types/voucher";
import { formatCurrency } from "@/utils/number";
import { ChevronRight, LoaderCircle, Search } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import VoucherCard from "../home-page/voucher-zone/voucher-card";

type Props = {
  items: CartItem[];
  totalSelected: number;
  toggleSelectAll: (b: boolean) => void;
  finalPrice: number;
  totalSaved: number;
  onSubmit: () => void;
  isLoading: boolean;
  vouchers: Voucher[];
};

function ActionBar({
  items,
  totalSelected,
  toggleSelectAll,
  finalPrice,
  totalSaved,
  isOpen,
  setIsOpen,
  onSubmit,
  isLoading,
}: Props & { setIsOpen: Dispatch<SetStateAction<boolean>>; isOpen: boolean }) {
  return (
    <div className="bg-white  w-full sm:grid sm:grid-cols-9 gap-4 sm:border p-2 pt-0 sm:p-4 ">
      {!isOpen && (
        <div
          className="flex items-center justify-between py-1"
          onClick={() => {
            setIsOpen((prev) => !prev);
          }}
        >
          <span className="text-xs font-bold text-[var(--red-brand)]">
            Chọn voucher
          </span>
          <ChevronRight size={12} />
        </div>
      )}
      <div className="flex justify-between items-center">
        <div className="sm:col-span-3 flex items-center gap-2">
          <Checkbox
            checked={totalSelected === items.length}
            onCheckedChange={toggleSelectAll}
            className="rounded-full border-[var(--red-brand)] data-[state=checked]:bg-[var(--red-brand)]"
          />
          <span>Tất cả</span>
        </div>
        <div className="sm:col-span-6 flex sm:grid grid-cols-8 gap-4">
          <div className="hidden sm:block col-span-3" />
          <div className="sm:col-span-3 justify-self-center flex flex-col justify-center sm:justify-self-end">
            <p className="text-xs flex items-center gap-1">
              Tổng tiền:{" "}
              {isLoading ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin text-[var(--brown-brand)]"
                />
              ) : (
                <span className="font-bold text-base text-[var(--red-brand)]">
                  {formatCurrency(finalPrice)}
                </span>
              )}
            </p>
            <p className="text-xs flex items-center gap-1">
              Tiết kiệm:{" "}
              {isLoading ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin text-[var(--brown-brand)]"
                />
              ) : (
                <span className="text-xs text-[var(--red-brand)]">
                  {formatCurrency(totalSaved)}
                </span>
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={onSubmit}
            className="sm:col-span-2 rounded-none bg-[var(--red-brand)] text-white max-sm:w-32"
          >
            Mua hàng
          </Button>
        </div>
      </div>
    </div>
  );
}

function MobileActionBar({
  items,
  totalSelected,
  toggleSelectAll,
  finalPrice,
  totalSaved,
  onSubmit,
  isLoading,
  vouchers,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 z-[51] sm:hidden w-full">
        <ActionBar
          items={items}
          totalSelected={totalSelected}
          toggleSelectAll={toggleSelectAll}
          finalPrice={finalPrice}
          totalSaved={totalSaved}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onSubmit={onSubmit}
          isLoading={isLoading}
          vouchers={vouchers}
        />
      </div>

      <Drawer
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <DrawerContent className="overflow-hidden" indicatorClassName="hidden">
          <DrawerHeader className="hidden">
            <DrawerTitle></DrawerTitle>
          </DrawerHeader>
          <div className="p-4 px-8  bg-[url('/icons/voucher-bg.svg')] bg-no-repeat bg-[var(--red-brand)]">
            <div className="relative mt-2">
              <Input
                placeholder="Nhập số điện thoại để hiển thị voucher"
                className="rounded-none"
              />
              <Search className="absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
            <ScrollArea
              className="flex h-[300px] mt-2 "
              viewportClassName="p-0"
            >
              {vouchers.map((voucher, index) => (
                <VoucherCard
                  voucher={voucher}
                  className="my-2 w-full"
                  key={index}
                />
              ))}
            </ScrollArea>
          </div>
          {
            // this is fix for drawer ::after issue, it covered the actual actionbar
          }
          <ActionBar
            items={items}
            totalSelected={totalSelected}
            toggleSelectAll={toggleSelectAll}
            finalPrice={finalPrice}
            totalSaved={totalSaved}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            onSubmit={onSubmit}
            isLoading={isLoading}
            vouchers={vouchers}
          />
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default MobileActionBar;
