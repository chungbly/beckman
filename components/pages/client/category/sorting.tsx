"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
const MobileFilter = dynamic(() => import("./mobile-filter"));

function ProductSorting({ count }: { count: number }) {
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sort = (() => {
    try {
      return JSON.parse(searchParams.get("sort") || "{}");
    } catch (error) {
      return {};
    }
  })();

  const currentSort = (() => {
    const sortKey = Object.keys(sort)?.[0] || "none";
    if (sortKey === "finalPrice" && !isMobile) {
      if (sort.finalPrice === 1) {
        return "price-asc";
      } else if (sort.finalPrice === -1) {
        return "price-desc";
      }
    }
    return sortKey;
  })();

  const tabs = [
    { id: "createdAt", label: "Mới nhất" },
    { id: "sold", label: "Bán chạy" },
  ];

  const handleTabClick = (value: string) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    if (sort[value]) {
      currentParams.delete("sort");
    } else {
      if (value === "price-asc") {
        currentParams.set("sort", JSON.stringify({ finalPrice: 1 }));
      } else if (value === "price-desc") {
        currentParams.set("sort", JSON.stringify({ finalPrice: -1 }));
      } else if (value === "createdAt") {
        currentParams.set("sort", JSON.stringify({ createdAt: -1 }));
      } else if (value === "sold") {
        currentParams.set("sort", JSON.stringify({ sold: -1 }));
      } else {
        currentParams.delete("sort");
      }
    }
    router.push(`?${currentParams.toString()}`);
  };

  return (
    <>
      {/* Desktop sorting */}
      <div className="hidden sm:flex justify-between items-center mb-4 gap-2 text-[#4E2919]">
        <div className="flex items-center gap-2">
          <span className="text-sm">BỘ LỌC:</span>
          <Select onValueChange={handleTabClick} value={''}>
            <SelectTrigger className="w-fit bg-transparent border-0 focus:ring-0 focus:ring-none focus:ring-offset-0">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Giá từ thấp đến cao</SelectItem>
              <SelectItem value="price-desc">Giá từ cao đến thấp</SelectItem>
              <SelectItem value="createdAt">Mới nhất</SelectItem>
              <SelectItem value="sold">Bán chạy</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={handleTabClick} value={''}>
            <SelectTrigger className="w-fit bg-transparent border-0 focus:ring-0 focus:ring-none focus:ring-offset-0">
              <SelectValue placeholder="Màu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Giá từ thấp đến cao</SelectItem>
              <SelectItem value="price-desc">Giá từ cao đến thấp</SelectItem>
              <SelectItem value="createdAt">Mới nhất</SelectItem>
              <SelectItem value="sold">Bán chạy</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={handleTabClick} value={''}>
            <SelectTrigger className="w-fit bg-transparent border-0 focus:ring-0 focus:ring-none focus:ring-offset-0">
              <SelectValue placeholder="Phân loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Giá từ thấp đến cao</SelectItem>
              <SelectItem value="price-desc">Giá từ cao đến thấp</SelectItem>
              <SelectItem value="createdAt">Mới nhất</SelectItem>
              <SelectItem value="sold">Bán chạy</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm">SẮP XẾP:</span>
            <Select onValueChange={handleTabClick} value={currentSort}>
              <SelectTrigger className="w-fit bg-transparent border-0 focus:ring-0 focus:ring-none focus:ring-offset-0">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không lọc</SelectItem>
                <SelectItem value="price-asc">Giá từ thấp đến cao</SelectItem>
                <SelectItem value="price-desc">Giá từ cao đến thấp</SelectItem>
                <SelectItem value="createdAt">Mới nhất</SelectItem>
                <SelectItem value="sold">Bán chạy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm">{count} sản phẩm</div>
        </div>
      </div>

      {/* Mobile sorting */}
      <div className="sm:hidden bg-[var(--rose-beige)] -mx-2 z-[49] sticky top-[var(--header-mobile-height)] grid grid-cols-4 overflow-x-auto py-2 mb-4 scrollbar-none text-xs text-[#4E2919]">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={cn(
              "col-span-1 text-center px-4 py-1 whitespace-nowrap",
              currentSort === tab.id && "font-bold ",
              index < tabs.length && "border-r border-[#4F2716]"
            )}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </div>
        ))}
        <div
          className={cn(
            "col-span-1 flex items-center justify-center gap-2 px-4 py-1 whitespace-nowrap",
            currentSort === "finalPrice" && "font-bold ",
            "border-r border-[#4F2716]"
          )}
          onClick={() => {
            if (currentSort === "finalPrice") {
              const currentValue = sort.finalPrice;
              const nextValue =
                currentValue === 1 ? -1 : currentValue === -1 ? 0 : 1;
              if (nextValue === 0) {
                const currentParams = new URLSearchParams(
                  searchParams.toString()
                );
                currentParams.delete("sort");
                router.push(`?${currentParams.toString()}`);
              } else {
                const currentParams = new URLSearchParams(
                  searchParams.toString()
                );
                currentParams.set(
                  "sort",
                  JSON.stringify({ finalPrice: nextValue })
                );
                router.push(`?${currentParams.toString()}`);
              }
            } else {
              handleTabClick("price-asc");
            }
          }}
        >
          Giá
          {sort.finalPrice === 1 ? (
            <ChevronUp size={12} fill="#4E2919" />
          ) : sort.finalPrice === -1 ? (
            <ChevronDown size={12} fill="#4E2919" />
          ) : (
            <ChevronsUpDown size={12} fill="#4E2919" />
          )}
        </div>
        <MobileFilter />
      </div>
    </>
  );
}

export default ProductSorting;
