"use client";
import { SubMenuLayout } from "@/types/admin-layout";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ReactGridLayout from "react-grid-layout";

import Link from "next/link";
function DesktopSubMenuHomePage({ submenu }: { submenu: SubMenuLayout }) {
  const [containerWidth, setContainerWidth] = useState(1200);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <motion.div
      className="relative mt-4 sm:mt-12 px-2 sm:px-0 max-sm:hidden"
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
      ref={containerRef}
    >
      <ReactGridLayout
        className="layout hidden sm:block"
        layout={submenu?.items?.map((item) => ({
          i: item.id,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          static: true,
        }))}
        rowHeight={submenu.height || 140}
        width={containerWidth}
        cols={submenu?.cols ?? 6}
        compactType="vertical"
        preventCollision={false}
        margin={[10, 10]}
        containerPadding={[0, 0]}
      >
        {submenu?.items?.map((item) => {
          if (!item.isDesktop) return null;
          if (item.type === "Banner" && item.image) {
            return (
              <Link
                key={item.id}
                href={item.href || "#"}
                className="group/sub-menu flex items-center justify-center h-full w-full overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1"
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <Image
                    width={135}
                    height={135}
                    quality={100}
                    sizes="200px"
                    src={item.image}
                    alt={"sub menu home page"}
                    className="object-cover aspect-square transition-transform duration-300 group-hover/sub-menu:scale-110"
                  />
                </motion.div>
              </Link>
            );
          }
        })}
      </ReactGridLayout>
    </motion.div>
  );
}

export default DesktopSubMenuHomePage;
