import { cn } from "@/lib/utils";
import { ChevronRight, Zap } from "lucide-react";
import Link from "next/link";

export function ViewMoreCard({ className }: { className?: string }) {
  return (
    <Link
      href="/flash-deals"
      className={cn(
        "bg-[#dcc7b6] h-full flex flex-col items-center justify-center group hover:opacity-90 transition-opacity",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden flex justify-center items-center w-[136px] sm:w-[212px]">
        <Zap className="w-20 h-20 text-[#FFD400]" fill="#FFD400" />
      </div>
      <div className="flex gap-2 items-center bg-[#4E2919] w-full justify-center p-4 sm:p-5">
        <div className="text-center text-sm sm:text-[20px] ">
          <p className="text-[var(--gray-beige)]">XEM THÊM</p>
          <p className="text-[var(--gray-beige)]">FLASH DEAL</p>
        </div>
        <ChevronRight
          size={55}
          className=" text-[var(--gray-beige)] group-hover:translate-x-1 transition-transform"
        />
      </div>
    </Link>
  );
}
