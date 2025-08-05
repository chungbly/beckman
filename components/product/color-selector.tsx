"use client";

import { Button } from "@/components/ui/button";

interface ColorSelectorProps {
  colors: string[];
  selectedColor?: string;
  onSelect: (color: string) => void;
}

export function ColorSelector({
  colors,
  selectedColor,
  onSelect,
}: ColorSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm">Lựa chọn màu</span>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <Button
            key={color}
            variant="outline"
            className={`h-10 px-4 font-normal rounded-sm bg-[var(--rose-beige)] ${
              selectedColor === color
                ? "bg-[var(--red-brand)] text-white"
                : "hover:bg-[var(--red-brand)] hover:text-white"
            }`}
            onClick={() => onSelect(color)}
          >
            {color}
          </Button>
        ))}
      </div>
    </div>
  );
}
