"use client";
import { getCategory } from "@/client/category.client";
import { cn } from "@/lib/utils";
import { useConfigs } from "@/store/useConfig";
import { Category } from "@/types/category";
import { IconFilter } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { FilterSection } from "./filter";
const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};
function MobileFilterV1() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<FilterSection>();
  const searchParams = useSearchParams();
  const params = useParams();
  const configs = useConfigs((s) => s.configs);
  const handleClose = () => setIsOpen(false);
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
      return Array.isArray(result) ? result : [];
    } catch (e) {
      const result = configs?.["FILTER_JSON"] || [];
      return Array.isArray(result) ? result : [];
    }
  }, [category, configs]);
  console.log("filter", filter);
  return (
    <div className="backdrop-blur-sm w-[60px] h-[60px] flex items-center justify-center bg-black/30 fixed bottom-6 right-6 rounded-full z-50">
      <IconFilter
        size={32}
        className="text-white"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setCurrentMenu(undefined);
          }
        }}
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="filter"
            initial={{ opacity: 0, top: -8, y: "-90%" }}
            animate={{ opacity: 1, top: -16, y: "-100%" }}
            exit={{ opacity: 0, top: -8, y: "-90%" }}
            transition={transition}
            className="absolute right-0 flex flex-col gap-4"
          >
            {filter.map((f) => {
              return (
                <div
                  key={f.title}
                  onClick={() =>
                    setCurrentMenu((prev) =>
                      prev?.id === f.id ? undefined : f
                    )
                  }
                  className="w-[60px] h-[60px] flex items-center justify-center bg-black/30  rounded-full text-white"
                >
                  <div
                    className={cn(
                      "w-[50px] h-[50px] flex items-center justify-center rounded-full text-white transition-all",
                      currentMenu?.id === f.id && "bg-white/30"
                    )}
                  >
                    {f.title}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {currentMenu && isOpen && (
          <motion.div
            key={currentMenu.id}
            initial={{ opacity: 0, right: 0 }}
            animate={{ opacity: 1, right: 80 }}
            exit={{ opacity: 0, right: 0 }}
            transition={transition}
            className=" absolute -top-4 -translate-y-full right-20 px-[20px] bg-black/30 rounded-[30px] backdrop-blur-sm z-[51] flex flex-col gap-4"
          >
            <div className="flex flex-col items-center justify-center text-white ">
              {currentMenu.options.map((item) => {
                return (
                  <div
                    key={item.value}
                    style={{
                      width: item.id === "size" ? "40px" : "max-content",
                    }}
                    className="w-full h-10 rounded-[20px] flex items-center justify-center"
                  >
                    {item.label}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MobileFilterV1;
