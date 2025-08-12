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
        "sm:pb-0 mt-12 relative h-auto sm:h-[800px]",
        pageNotShowFooterList.includes(pathname) && "hidden"
      )}
    >
      <div className="max-sm:hidden relative container h-full mx-auto flex items-center justify-center">
        <Image
          src="/images/footer-bg.png"
          alt="footer bg"
          width={1920}
          height={800}
          className="max-w-[1920px] w-full h-auto aspect-[1920/800] pointer-events-none"
        />
      </div>
      {children}
    </footer>
  );
}

export default ClientFooterWrapper;
