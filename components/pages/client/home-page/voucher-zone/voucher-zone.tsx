"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getCustomerQuery } from "@/query/customer.query";
import { getCouponsQuery, getUserVouchersQuery } from "@/query/voucher.query";
import { Voucher } from "@/types/voucher";
import "@fontsource/road-rage/latin.css";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import VoucherCard from "./voucher-card";

export default function VoucherZoneContainer({
  className,
  userId,
  size = "large",
}: {
  className?: string;
  userId: string;
  size?: "small" | "large";
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: vouchers } = useQuery(getUserVouchersQuery(userId));
  const { data: coupons } = useQuery(getCouponsQuery());
  const { data: customer } = useQuery(getCustomerQuery(userId));

  if (!vouchers?.length && !coupons?.length) return null;
  const data = [...(vouchers || []), ...(coupons || [])].reduce((acc, cur) => {
    if (acc.find((voucher) => voucher.code === cur.code)) return acc;
    return [...acc, cur];
  }, [] as Voucher[]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const voucherCard = document.querySelector(
      ".voucher-card"
    ) as HTMLDivElement;
    if (!voucherCard) return;

    const scrollAmount = voucherCard.offsetWidth + 16;
    const container = scrollContainerRef.current;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (size === "small") {
    return (
      <ScrollArea className="p-4 px-8 flex bg-[url('/icons/voucher-bg.svg')] bg-no-repeat h-[300px] bg-[var(--red-brand)]">
        {data.map((voucher, index) => (
          <VoucherCard
            voucher={voucher}
            className="my-2 w-full"
            key={index}
            customer={customer}
          />
        ))}
      </ScrollArea>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("bg-[#8B1F18] relative py-4 px-4", className)}
    >
      <Image
        src={"/icons/voucher-bg.svg"}
        fill
        alt="voucher-bg"
        priority
        className="object-cover"
      />
      <h2 className="text-3xl sm:text-[calc(3rem+2px)] font-bold text-white mb-4 font-road-rage ">
        Voucher Zone
      </h2>
      <div className="relative group ">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 sm:mx-8"
        >
          {data.map((voucher, index) => (
            <VoucherCard
              customer={customer}
              key={index}
              voucher={voucher}
              className="w-[calc(100%/1.25-0.75rem)] min-w-[calc(100%/1.25-0.75rem)] sm:w-[calc(100%/3-0.75rem)] sm:min-w-[calc(100%/3-0.75rem)]"
            />
          ))}
        </div>

        {/* Scroll buttons */}
        {data.length > 3 && (
          <>
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 hidden sm:flex items-center justify-center"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>

            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 hidden sm:flex items-center justify-center"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          </>
        )}

        <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </motion.div>
  );
}
