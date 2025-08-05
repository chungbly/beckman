"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { DualRangeSlider } from "@/components/ui/slider";
import { TooltipWrap } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/number";
import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface FilterOption {
  id: string;
  label: string;
  value: string | number;
}

export interface FilterSection {
  id: string;
  title: string;
  type: "grid" | "list" | "range";
  step?: number;

  options: FilterOption[];
}

const SizeButton = ({
  size,
  className,
}: {
  size: string;
  className?: string;
}) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full p-2 text-base justify-center font-normal hover:bg-[var(--light-beige)] hover:text-[var(--red-brand)] hover:font-bold h-fit bg-[var(--rose-beige)]",
        className
      )}
    >
      {size}
    </Button>
  );
};

const ColorButton = ({
  color,
  label,
  className,
  isSelected,
}: {
  color: string;
  label: string;
  className?: string;
  isSelected?: boolean;
}) => {
  return (
    <TooltipWrap content={label}>
      <Button
        variant="ghost"
        className={cn(
          "relative w-4 h-4 p-4 text-base rounded-full justify-center font-normal hover:bg-[var(--light-beige)] hover:text-[var(--red-brand)] hover:font-bold",
          className
        )}
        style={{ backgroundColor: color }}
      >
        {isSelected && <Check className="text-white w-4 h-4 absolute" />}
      </Button>
    </TooltipWrap>
  );
};

const PriceRangeSlider = ({
  min,
  max,
  step,
}: {
  min: number;
  max: number;
  step: number;
}) => {
  const searchParams = useSearchParams();
  const [values, setValues] = useState(() => {
    const prices = searchParams.get("prices");
    try {
      const parsedPrices = JSON.parse(prices || "[]");
      if (parsedPrices.length === 2) {
        return parsedPrices;
      }
      return [min, max];
    } catch (e) {
      return [min, max];
    }
  });
  const getTagsSearchParams = (tag: number[]) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("prices", JSON.stringify(values));
    return `?${currentParams.toString()}`;
  };
  return (
    <div className="space-y-3 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Input
            value={values[0]}
            onChange={(e) =>
              setValues([Math.max(+e.target?.value, 0), values[1]])
            }
          />
          <p className="text-xs text-foreground/80">
            {formatCurrency(values[0])}
          </p>
        </div>
        <div className="space-y-1">
          <Input
            value={values[1]}
            onChange={(e) => setValues([values[0], +e.target?.value || max])}
          />
          <p className="text-xs text-foreground/80">
            {formatCurrency(values[1])}
          </p>
        </div>
      </div>
      <DualRangeSlider
        // label={(value) => <span>{value}℃</span>}
        value={values}
        onValueChange={setValues}
        min={min}
        max={max}
        step={step}
      />
      <Link className="block" href={getTagsSearchParams(values)}>
        <Button className="float-right bg-[var(--gray-beige)] hover:bg-[var(--gray-beige)]">
          Áp dụng
        </Button>
      </Link>
    </div>
  );
};

function ProductFilter({
  className,
  filterSections,
}: {
  className?: string;
  filterSections: FilterSection[];
}) {
  const searchParams = useSearchParams();
  const { tags, sizeTags, colorTags } = (() => {
    const tagString = searchParams.get("tags");
    const sizeTags = searchParams.get("sizeTags");
    const colorTags = searchParams.get("colorTags");
    try {
      return {
        tags: (tagString ? JSON.parse(tagString) : []) as string[],
        sizeTags: sizeTags ? JSON.parse(sizeTags) : ([] as number[]),
        colorTags: colorTags ? JSON.parse(colorTags) : ([] as string[]),
      };
    } catch (e) {
      return {
        tags: [] as string[],
        sizeTags: [] as number[],
        colorTags: [] as string[],
      };
    }
  })();

  const getTagsSearchParams = (tag: string) => {
    const currentParams = new URLSearchParams(searchParams.toString());

    if (!tags.includes(tag)) {
      currentParams.set(
        "tags",
        JSON.stringify(Array.from(new Set([...tags, tag])))
      );
      return `?${currentParams.toString()}`;
    }
    currentParams.set(
      "tags",
      JSON.stringify(tags.filter((t: string) => t !== tag))
    );
    return `?${currentParams.toString()}`;
  };

  const getSizeTagsSearchParams = (tag: string) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    if (!sizeTags.includes(tag)) {
      currentParams.set(
        "sizeTags",
        JSON.stringify(Array.from(new Set([...sizeTags, tag])))
      );
      return `?${currentParams.toString()}`;
    }
    currentParams.set(
      "sizeTags",
      JSON.stringify(sizeTags.filter((t: number) => t.toString() !== tag))
    );
    return `?${currentParams.toString()}`;
  };

  const getColorTagsSearchParams = (tag: string) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    if (!colorTags.includes(tag)) {
      currentParams.set(
        "colorTags",
        JSON.stringify(Array.from(new Set([...colorTags, tag])))
      );
      return `?${currentParams.toString()}`;
    }
    currentParams.set(
      "colorTags",
      JSON.stringify(colorTags.filter((t: string) => t !== tag))
    );
    return `?${currentParams.toString()}`;
  };

  return (
    <div className={cn("col-span-1 space-y-4 hidden sm:block", className)}>
      <h2 className="text-xl font-semibold mb-4 text-[#4E2919]">
        Bộ lọc sản phẩm
      </h2>

      {filterSections.map((section) => {
        return (
          <Collapsible key={section.id} defaultOpen className="text-[#171718]">
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-bold">
              {section.title}
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent
              className={cn(
                "space-y-2 overflow-hidden duration-300 transition-all data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown"
              )}
            >
              {section.type === "grid" && section.id === "size" && (
                <div className="grid grid-cols-5 gap-2">
                  {section.options.map((option) => {
                    const isSelected = sizeTags.includes(
                      option.value.toString()
                    );
                    return (
                      <Link
                        href={getSizeTagsSearchParams(option.value.toString())}
                        key={option.id}
                      >
                        <SizeButton
                          size={option.value.toString()}
                          className={cn(
                            isSelected && "bg-[var(--red-brand)] text-white"
                          )}
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
              {section.type === "grid" && section.id === "color" && (
                <div className="grid grid-cols-5 gap-2">
                  {section.options.map((option) => {
                    const isSelected = colorTags.includes(option.value);
                    return (
                      <Link
                        href={getColorTagsSearchParams(option.value.toString())}
                        key={option.id}
                      >
                        <ColorButton
                          label={option.value as string}
                          isSelected={isSelected}
                          color={option.label as string}
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
              {section.type === "range" && (
                <PriceRangeSlider
                  key={section.id}
                  min={
                    section.options.find((o) => o.id === "min")?.value as number
                  }
                  max={
                    section.options.find((o) => o.id === "max")?.value as number
                  }
                  step={section.step || 1}
                />
              )}
              {section.options.map((option) => {
                if (section.type === "grid") {
                  return null;
                }
                if (section.type === "range") {
                  return null;
                }
                const isSelected = tags.includes(option.value.toString());
                return (
                  <Link
                    key={option.id}
                    className={cn(
                      "block w-full text-base font-normal hover:text-[var(--red-brand)] hover:font-bold",
                      isSelected ? "text-[var(--red-brand)] font-bold" : ""
                    )}
                    href={getTagsSearchParams(option.value.toString())}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}

export default ProductFilter;
