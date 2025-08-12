"use client";
import { cn } from "@/lib/utils";
import { IconFilter } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FilterSection } from "./filter";
const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};
function MobileFilter({
  count,
  filter,
  getTagsSearchParams,
  sort,
  tags,
  sizeTag,
  colorTag,
}: {
  count: number;
  filter: FilterSection[];
  getTagsSearchParams: (tag: string, menu: FilterSection) => string;
  sort: string;
  tags: string[];
  sizeTag: string;
  colorTag: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<FilterSection>();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (ref?.current && !ref?.current.contains(ev.target as Node)) {
        setIsOpen(false);
        setCurrentMenu(undefined);
      }
    }

    function handleScroll() {
      setIsOpen(false);
      setCurrentMenu(undefined);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll);
    };
  }, [ref]);

  return (
    <div
      ref={ref}
      className={cn(
        "sm:hidden w-[60px] h-[60px] transition-all duration-300 flex items-center justify-center bg-black/30 fixed bottom-6 right-6 rounded-full z-10",
        isOpen && "w-[140px] text-white px-4"
      )}
    >
      {isOpen && <span className="line-clamp-1">{count} sản phẩm</span>}
      <IconFilter
        size={32}
        className="text-white"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setCurrentMenu(undefined);
          }
          const scrollToTop = document.getElementById("scroll-to-top");
          if (scrollToTop) {
            scrollToTop.style.display = !isOpen ? "none" : "flex";
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
                  key={f.id}
                  onClick={() =>
                    setCurrentMenu((prev) =>
                      prev?.id === f.id ? undefined : f
                    )
                  }
                  className="backdrop-blur-sm w-[60px] h-[60px] flex items-center justify-center bg-black/30  rounded-full text-white"
                >
                  <div
                    className={cn(
                      "w-[50px] h-[50px] flex items-center text-center justify-center rounded-full text-white transition-all",
                      currentMenu?.id === f.id && "bg-white/50"
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
            exit={{ opacity: 0, right: 0, display: "none" }}
            transition={transition}
            className={cn(
              "absolute -top-4 -translate-y-full right-20 p-[10px] bg-black/30 rounded-[30px] backdrop-blur-sm z-[51] flex flex-col gap-4",
              currentMenu.id === "size" && "px-[10px]"
            )}
          >
            <div className="flex flex-col items-center justify-center text-white ">
              {currentMenu.options.map((item) => {
                const isActive =
                  currentMenu.id == "size"
                    ? sizeTag == item.value
                    : currentMenu.id == "color"
                    ? colorTag == item.value
                    : currentMenu.id == "sort"
                    ? sort == item.value
                    : tags.includes(item.value.toString());
                return (
                  <Link
                    key={item.value}
                    href={getTagsSearchParams(
                      item.value.toString(),
                      currentMenu
                    )}
                    className={cn(
                      "relative min-w-max w-full h-10 rounded-[20px] px-2 flex items-center justify-center",
                      currentMenu.id === "size" && "w-[40px]"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="highlight"
                        className="absolute inset-0 bg-white/30 rounded-[20px]"
                        transition={{
                          type: "spring",
                          stiffness: 100,
                          damping: 10,
                        }}
                      />
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MobileFilter;
