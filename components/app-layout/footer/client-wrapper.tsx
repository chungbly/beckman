"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";

function ClientFooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const pageNotShowFooterList = ["/gio-hang"];
  return (
    <footer
      className={cn(
        "sm:pb-0 mt-12 relative",
        pageNotShowFooterList.includes(pathname) && "hidden"
      )}
    >
      <Image
        src="/images/footer-bg.png"
        alt="footer bg"
        fill
        className="absolute top-0 left-0 w-full h-auto aspect-[1920/800] pointer-events-none"
      />
      {children}
    </footer>
  );
}

export default ClientFooterWrapper;
