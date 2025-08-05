"use client";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import React from "react";

function ClientFooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const pageNotShowFooterList = ["/gio-hang"];
  return (
    <footer
      className={cn(
        "bg-[#D9D9D9] pb-12 sm:pb-0 mt-12 relative",
        pageNotShowFooterList.includes(pathname) && "hidden"
      )}
    >
      {children}
    </footer>
  );
}

export default ClientFooterWrapper;
