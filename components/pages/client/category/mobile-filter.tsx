"use client";
import { getCategory } from "@/client/category.client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { IconFilter } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import ProductFilter from "./filter";
import { useConfigs } from "@/store/useConfig";
import { Category } from "@/types/category";
const MobileFilter = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const configs = useConfigs(s=>s.configs);
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  const { data: category } = useQuery({
    queryKey: ["category", params.name],
    queryFn: async () => {
      const res = await getCategory(params.name as string);
      const category = res.data;
      return category ? category : {} as Category;
    },
  });

  const filter = (() => {
    if(!category) return [];
    try {
      const result = category.filterJSON
        ? JSON.parse(category.filterJSON?.trim())
        : configs?.["FILTER_JSON"];
      return Array.isArray(result) ? result : [];
    } catch (e) {
      const result = configs?.["FILTER_JSON"] || [];
      return Array.isArray(result) ? result : [];
    }
  })();

  const sort = (() => {
    const sortString = searchParams.get("sort");
    try {
      return sortString ? JSON.parse(sortString) : {};
    } catch (e) {
      return {};
    }
  })();
  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="px-4 py-1 whitespace-nowrap flex items-center justify-center gap-2 text-xs"
      >
        Bộ lọc
        <IconFilter size={14} fill="#4E2919" />
      </div>
      <Sheet open={isOpen} onOpenChange={() => setIsOpen(false)}>
        <SheetContent className="p-2 grid grid-cols-1 overflow-y-auto">
          <SheetHeader className="hidden">
            <SheetTitle></SheetTitle>
          </SheetHeader>
          <ProductFilter filterSections={filter} className="block mt-2 px-2" />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileFilter;
