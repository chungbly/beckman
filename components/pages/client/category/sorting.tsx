"use client";
import { getCategory } from "@/client/category.client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Category } from "@/types/category";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { FilterSection } from "./filter";
import MobileFilter from "./mobile-filter";

function ProductSorting({
  count,
  configs,
}: {
  count: number;
  configs: Record<string, unknown>;
}) {
  const params = useParams();
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: category } = useQuery({
    queryKey: ["category", params.name],
    queryFn: async () => {
      const res = await getCategory(params.name as string);
      const category = res.data;
      return category ? category : ({} as Category);
    },
  });

  const filter: FilterSection[] = useMemo(() => {
    if (!category) return [];
    try {
      const result = category.filterJSON
        ? JSON.parse(category.filterJSON?.trim())
        : configs?.["FILTER_JSON"];
      if (!Array.isArray(result)) return [];
      return result;
    } catch (e) {
      const result = configs?.["FILTER_JSON"] || [];
      return Array.isArray(result) ? result : [];
    }
  }, [category, configs]);

  const { tags, sizeTag, sort, colorTag } = (() => {
    const tagString = searchParams.get("tags");
    const sizeTag = searchParams.get("sizeTag");
    const colorTag = searchParams.get("colorTag");

    try {
      return {
        tags: (tagString ? JSON.parse(tagString) : []) as string[],
        sort: JSON.parse(searchParams.get("sort") || "{}"),
        sizeTag: sizeTag || "",
        colorTag: colorTag || "",
      };
    } catch (e) {
      return {
        tags: [],
        sort: {},
        sizeTag: "",
        colorTag: "",
      };
    }
  })();

  const currentSort = (() => {
    const sortKey = Object.keys(sort)?.[0] || "none";
    if (sortKey === "finalPrice") {
      if (sort.finalPrice === 1) {
        return "price-asc";
      } else if (sort.finalPrice === -1) {
        return "price-desc";
      }
    }
    return sortKey;
  })();

  const getTagsSearchParams = (tag: string, menu?: FilterSection) => {
    const currentParams = new URLSearchParams(searchParams.toString());

    if (menu?.id === "size") {
      currentParams.set("sizeTag", tag);
    } else if (menu?.id === "color") {
      currentParams.set("colorTag", tag);
    } else if (menu?.id === "sort") {
      if (sort[tag]) {
        currentParams.delete("sort");
      } else {
        if (tag === "price-asc") {
          currentParams.set("sort", JSON.stringify({ finalPrice: 1 }));
        } else if (tag === "price-desc") {
          currentParams.set("sort", JSON.stringify({ finalPrice: -1 }));
        } else if (tag === "createdAt") {
          currentParams.set("sort", JSON.stringify({ createdAt: -1 }));
        } else {
          currentParams.delete("sort");
        }
      }
    } else {
      currentParams.set(
        "tags",
        JSON.stringify(
          Array.from(
            new Set([
              ...tags.filter((t) => !menu?.options.some((i) => i.value == t)),
              tag,
            ])
          )
        )
      );
    }
    return `?${currentParams.toString()}`;
  };

  const activeTab = (() => {
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

  const tabs = [
    { id: "createdAt", label: "Mới nhất" },
    { id: "sold", label: "Bán chạy" },
  ];
  return (
    <>
      {/* Desktop sorting */}
      <div className="hidden sm:flex justify-between items-center mb-4 gap-2 text-[#4E2919]">
        <div className="flex items-center gap-2">
          <span className="text-xl">BỘ LỌC:</span>
          {filter.map((f) => {
            if (f.id === "sort") return null;

            const value =
              f.id === "size"
                ? sizeTag
                : f.id === "color"
                ? colorTag
                : f.options
                    .find((o) => tags.includes(o.value.toString()))
                    ?.value.toString();

            return (
              <Select
                onValueChange={(v) => router.push(getTagsSearchParams(v, f))}
                value={value}
                key={f.id}
              >
                <SelectTrigger className="text-xl w-fit bg-transparent border-0 focus:ring-0 focus:ring-none focus:ring-offset-0">
                  <SelectValue placeholder={f.title} />
                </SelectTrigger>
                <SelectContent className="bg-[#FFECD9] border-[var(--brown-brand)] ">
                  {f.options.map((o) => {
                    return (
                      <SelectItem
                        className="focus:bg-white"
                        value={o.value.toString()}
                        key={o.id}
                      >
                        {o.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            );
          })}
        </div>
        <div className="flex justify-around gap-4 items-center max-w-fit">
          <span className="text-xl">SẮP XẾP:</span>
          {filter.map((f) => {
            if (f.id !== "sort") return null;

            return (
              <Select
                onValueChange={(v) => router.push(getTagsSearchParams(v, f))}
                value={currentSort}
                key={f.id}
              >
                <SelectTrigger className="text-xl  w-fit bg-transparent border-0 focus:ring-0 focus:ring-none focus:ring-offset-0">
                  <SelectValue placeholder={f.title} />
                </SelectTrigger>
                <SelectContent className="bg-[#FFECD9] ">
                  {f.options.map((o) => {
                    return (
                      <SelectItem
                        className="focus:bg-white "
                        value={o.value.toString()}
                        key={o.id}
                      >
                        {o.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            );
          })}
          <div className="text-xl">{count} sản phẩm</div>
        </div>
      </div>
      {/* Mobile sorting */}
      <div className="sm:hidden bg-[var(--rose-beige)] -mx-2 z-[49] sticky top-[var(--header-mobile-height)] grid grid-cols-4 overflow-x-auto py-2 mb-4 scrollbar-none text-xs text-[#4E2919]">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={cn(
              "col-span-1 text-center px-4 py-1 whitespace-nowrap",
              activeTab === tab.id && "font-bold ",
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
            activeTab === "finalPrice" && "font-bold ",
            "border-r border-[#4F2716]"
          )}
          onClick={() => {
            if (activeTab === "finalPrice") {
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
