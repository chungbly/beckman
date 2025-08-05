"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function ReadMore({
  children,
  maxHeight = 400,
}: {
  children: React.ReactNode;
  maxHeight?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);
  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(
        (contentRef.current as HTMLDivElement).scrollHeight > maxHeight
      );
    }
  }, [maxHeight]);
  return (
    <div
      className={cn(
        "col-span-full relative pb-10",
        isExpanded ? "pb-10" : "pb-0"
      )}
    >
      <div
        className={cn("overflow-hidden", isOverflowing && "mb-8")}
        ref={contentRef}
        style={{
          maxHeight: isExpanded ? "none" : maxHeight,
        }}
      >
        {children}
      </div>
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 block h-full",
          isExpanded
            ? "h-10"
            : isOverflowing
            ? "bg-gradient-to-b from-white/10 to-white/100"
            : ""
        )}
      >
        {isOverflowing && (
          <Button
            variant="ghost"
            onClick={() => setIsExpanded((prev) => !prev)}
            className={cn(
              "absolute bg-[var(--light-beige)] bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center h-auto text-[var(--brown-brand)]"
            )}
          >
            <ChevronDown
              className={cn(
                "transition-transform duration-300 ",
                isExpanded ? "rotate-180" : "rotate-0"
              )}
            />
            {isExpanded ? "Thu gọn" : "Xem thêm"}
          </Button>
        )}
      </div>
    </div>
  );
}
export default ReadMore;
