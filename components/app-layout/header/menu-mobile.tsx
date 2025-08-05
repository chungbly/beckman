"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getCategoryQuery } from "@/query/category.query";
import { Customer } from "@/types/customer";
import { useQuery } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { useState } from "react";
import { MobileSidebar } from "./mobile-sidebar";
const MenuMobile = ({ customer }: { customer?: Customer | null }) => {
  const { data } = useQuery(getCategoryQuery);
  const categories = data?.filter((c) => c.isShow);
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <div
        className="sm:hidden mr-2 text-white"
        onClick={() => setIsOpen(true)}
      >
        <Menu />
      </div>
      <Sheet open={isOpen} onOpenChange={() => setIsOpen(false)}>
        <SheetContent className="p-2">
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
