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
import { useConfigs } from "@/store/useConfig";
import { Category } from "@/types/category";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { FilterSection } from "./filter";
import MobileFilter from "./mobile-filter";

function ProductSorting({ count }: { count: number }) {
  const isMobile = useIsMobile();
  const params = useParams();
  const searchParams = useSearchParams();
  const configs = useConfigs((s) => s.configs);
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
    if (sortKey === "finalPrice" && !isMobile) {
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
                      <SelectItem value={o.value.toString()} key={o.id}>
                        {o.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            );
          })}
        </div>
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">SẮP XẾP:</span>
            {filter.map((f) => {
              if (f.id !== "sort") return null;

              return (
                <Select
                  onValueChange={(v) => router.push(getTagsSearchParams(v, f))}
                  value={currentSort}
                  key={f.id}
                >
                  <SelectTrigger className="text-xl w-fit bg-transparent border-0 focus:ring-0 focus:ring-none focus:ring-offset-0">
                    <SelectValue placeholder={f.title} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#FFECD9] ">
                    {f.options.map((o) => {
                      return (
                        <SelectItem value={o.value.toString()} key={o.id}>
                          {o.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              );
            })}
          </div>
          <div className="text-xl">{count} sản phẩm</div>
        </div>
      </div>
      {filter.length > 0 && (
        <MobileFilter
          count={count}
          filter={filter}
          getTagsSearchParams={getTagsSearchParams}
          sort={currentSort}
          tags={tags}
          sizeTag={sizeTag}
          colorTag={colorTag}
        />
      )}
    </>
  );
}

export default ProductSorting;
