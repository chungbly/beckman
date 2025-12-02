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
        "sm:pb-0 mt-12 relative h-auto",
        pageNotShowFooterList.includes(pathname) && "hidden"
      )}
    >
      <Image
        src="/_images/footer_bg.png"
        alt="footer bg"
        width={1920}
        height={800}
        className="w-full h-auto aspect-[1920/800] pointer-events-none max-sm:hidden"
      />
      {children}
    </footer>
  );
}

export default ClientFooterWrapper;
