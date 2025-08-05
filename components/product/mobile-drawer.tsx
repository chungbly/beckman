"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MinusIcon, PlusIcon, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";

export default function ProductDrawer() {
  const [quantity, setQuantity] = React.useState(1);
  const [selectedSize, setSelectedSize] = React.useState("41");

  const sizes = ["39", "40", "41", "42", "43", "44"];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Product</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] w-full">
        <SheetHeader className="relative mb-4">
          <SheetTitle asChild>
            <div className="flex gap-4">
              <div className="w-24 h-24 relative rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg"
                  alt="Derby Shoes"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-base">
                  Giày Derby Captoe Classic Parisian - Nâu Patina
                </h3>
                <p className="text-2xl font-bold mt-1">1.150.000 đ</p>
                <p className="text-sm text-muted-foreground mt-1">
                  NÂU PATINA, 39
                </p>
              </div>
              <SheetTrigger className="absolute right-0 top-0">
                <X className="h-4 w-4" />
              </SheetTrigger>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Size Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">SIZE</Label>
              <Button variant="link" className="text-primary h-auto p-0">
                QUY CHUẨN →
              </Button>
            </div>
            <RadioGroup
              defaultValue={selectedSize}
              onValueChange={setSelectedSize}
              className="grid grid-cols-6 gap-2"
            >
              {sizes.map((size) => (
                <Label
                  key={size}
                  className={`flex items-center justify-center px-3 py-2 rounded-md border cursor-pointer ${
                    selectedSize === size
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem
                    value={size}
                    className="sr-only"
                    id={`size-${size}`}
                  />
                  {size}
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Color Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">MÀU</Label>
            <div className="flex items-center gap-2 border rounded-md p-2 bg-muted/50">
              <div className="w-10 h-10 rounded overflow-hidden">
                <Image
                  src="/placeholder.svg"
                  alt="Nâu Patina"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <span className="text-sm">NÂU PATINA</span>
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Số lượng</Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-lg">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Confirm Button */}
          <Button className="w-full" size="lg">
            Xác nhận
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
