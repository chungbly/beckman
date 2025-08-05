"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeUserId } from "@/lib/cookies";
import { useCartStore } from "@/store/useCart";
import { useCustomerStore } from "@/store/useCustomer";
import { Customer } from "@/types/customer";
import { ChevronDown, CircleUserRound } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

function LoggedUser({ customer }: { customer: Customer }) {
  const handleLogout = async () => {
    await removeUserId();
    window.location.replace("/");
  };

  useEffect(() => {
    if (customer) {
      useCustomerStore.setState({
        customer,
      });
      useCartStore.setState({
        info: {
          ...useCartStore.getState().info,
          fullName: customer.name,
          phoneNumber: customer.phoneNumbers[0],
        }
      })
    }
  }, [customer]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="hidden sm:flex  items-center gap-2 p-4 cursor-pointer  ">
          <CircleUserRound className="w-6 h-6  text-white" />
          <span className="text-white min-w-max hover:underline">
            {customer.name}
          </span>
          <ChevronDown className="text-white" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/account">Thông tin</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>Đăng xuất</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LoggedUser;
