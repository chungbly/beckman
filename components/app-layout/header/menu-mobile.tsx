"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Category } from "@/types/category";
import { Customer } from "@/types/customer";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { MobileSidebar } from "./mobile-sidebar";
const MenuMobile = ({
  customer,
  categories,
}: {
  customer?: Customer | null;
  categories: Category[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <div
        className="sm:hidden mr-2 text-[var(--brown-brand)]"
        onClick={() => setIsOpen(true)}
      >
        {isOpen ? <X /> : <Menu />}
      </div>
      <Sheet open={isOpen} onOpenChange={() => setIsOpen(false)}>
        <SheetContent
          className="p-0 top-[60px] w-full"
          overlayClassName="bg-transparent"
          closeIconClassName="hidden"
        >
          <SheetHeader>
            <SheetTitle></SheetTitle>
          </SheetHeader>
          <MobileSidebar
            categories={categories!}
            customer={customer}
            handleClose={handleClose}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MenuMobile;
