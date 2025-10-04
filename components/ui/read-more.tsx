"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function ReadMore({
  children,
  maxHeight = 400,
  className,
}: {
  children: React.ReactNode;
  maxHeight?: number;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      const scrollH = el.scrollHeight;
      setContentHeight(scrollH);
      setIsOverflowing(scrollH > maxHeight);
    }
  }, [children, maxHeight]);

  return (
    <div
      className={cn("col-span-full relative", className, isExpanded && "pb-24")}
    >
      <motion.div
        ref={contentRef}
        initial={false}
        animate={{
          height: isExpanded
            ? "auto"
            : isOverflowing
            ? maxHeight
            : contentHeight, // 👈 Nếu nội dung nhỏ hơn maxHeight → auto fit
        }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 20,
        }}
        className={cn(
          "overflow-hidden",
          !isExpanded && isOverflowing && "mb-8"
        )}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {isOverflowing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "absolute bottom-0 left-0 right-0",
              !isExpanded &&
                "bg-gradient-to-b from-[#F0F0F0]/10 to-[#F0F0F0] h-[400px]"
            )}
          >
            <div
              onClick={() => setIsExpanded((prev) => !prev)}
              className={cn(
                "absolute cursor-pointer uppercase bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center text-[#36454F] text-2xl font-bold px-2"
              )}
            >
              {isExpanded ? "Thu lại" : "Xem thêm"}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/icons/drop-down.svg"
                  alt="drop-down"
                  width={20}
                  height={20}
                  className="mt-2"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ReadMore;
