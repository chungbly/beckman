"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useConfigs } from "@/store/useConfig";
import { Product } from "@/types/product";
import { Separator } from "@radix-ui/react-separator";
import { useState } from "react";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize?: string;
  selectedColor?: string;
  onSelect: (size: string) => void;
  variants: Product[];
}

export function SizeSelector({
  sizes,
  selectedSize,
  selectedColor,
  onSelect,
  variants,
}: SizeSelectorProps) {
  const configs = useConfigs((s) => s.configs);
  const SIZE_MAPPING = (configs?.SIZE_MAPPING || []) as {
    us: number;
    eu: number;
  }[];
  const [isEu, setIsEu] = useState(true);
  const displaySize = (size: string) => {
    // if size is not a number, it's a size tex
    if(!Number.isInteger(Number(size))) return size;
    const sizeNumber = Number(size);
    if (!isEu) {
      const mapping = SIZE_MAPPING.find((s) => s.eu === sizeNumber);
      return mapping?.us;
    }
    return sizeNumber;
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm">Lựa chọn size</span>
        <div className="flex items-center gap-2">
          <div
            className={cn("cursor-pointer",isEu && "text-[var(--red-brand)] font-bold")}
            onClick={() => setIsEu(true)}
          >
            EU
          </div>
          <Separator
            orientation="vertical"
            className="w-[1px] h-[12px] bg-black"
          />
          <div
            className={cn("cursor-pointer",!isEu && "text-[var(--red-brand)] font-bold")}
            onClick={() => setIsEu(false)}
          >
            US
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes
          .sort((a, b) => Number(a) - Number(b))
          .map((size) => {
            const isAvailable = selectedColor
              ? variants?.some(
                  (variant) =>
                    variant.size === size &&
                    variant.color === selectedColor &&
                    variant.stock > 0
                )
              : true;
            return (
              <Button
                key={size}
                variant="outline"
                disabled={!isAvailable}
                className={cn(
                  "h-10 w-10 rounded-sm font-normal px-4 hover:bg-[var(--red-brand)] bg-[var(--rose-beige)] text-black hover:text-white",
                  selectedSize === size && "bg-[var(--red-brand)] text-white"
                )}
                onClick={() => onSelect(size)}
              >
                {displaySize(size)}
              </Button>
            );
          })}
      </div>
    </div>
  );
}
