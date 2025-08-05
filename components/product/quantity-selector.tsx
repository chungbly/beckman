"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm ">Số lượng</span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={() => quantity > min && onQuantityChange(quantity - 1)}
          disabled={quantity <= min}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="w-16 h-10 flex items-center justify-center border rounded-md">
          {quantity}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={() => quantity < max && onQuantityChange(quantity + 1)}
          disabled={quantity >= max}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
