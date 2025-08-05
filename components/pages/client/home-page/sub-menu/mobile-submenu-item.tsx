"use client";
import { SubMenuLayout } from "@/types/admin-layout";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

function MobileSubMenuHomePage({ submenu }: { submenu: SubMenuLayout }) {
  return (
    <motion.div
      className="relative mt-4 sm:mt-12 px-2 sm:px-0 sm:hidden"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      initial="hidden"
      animate="show"
    >
      {!!submenu?.items?.length && (
        <div className="sm:hidden flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {submenu?.items.map((item) => {
            if (!item.isMobile) return null;
            if (item.type === "Banner" && item.image) {
              return (
                <Link
                  href={item.href || "#"}
                  key={item.id}
                  className="min-w-[calc((100%-4rem)/4)] flex items-center justify-center"
                >
                  <Image
                    width={84}
                    height={84}
                    quality={100}
                    sizes="100px"
                    src={item.image}
                    alt={"sub menu home page"}
                    className="object-cover aspect-square min-w-[84px]"
                  />
                </Link>
              );
            }
          })}
        </div>
      )}
    </motion.div>
  );
}

export default MobileSubMenuHomePage;
