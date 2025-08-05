"use client";

import {
  CategoryTree,
  getChildCategories,
} from "@/app/(admin)/admin/categories/container";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, SubMenuItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";
import { useConfigs } from "@/store/useConfig";
import { Category } from "@/types/category";
import { ChevronDown, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
const HeaderSearch = dynamic(() => import("./header-search"));
export function HeaderMenu({ categories }: { categories: Category[] }) {
  const configs = useConfigs((s) => s.configs);
  const categoriesTree = categories
    ?.filter((c) => !c.parentId && c.isShow)
    ?.map((category) => {
      return {
        ...category,
        slug: category.seo?.slug,
        children:
          getChildCategories(
            categories as unknown as CategoryTree[],
            category._id
          ) ?? [],
      };
    });

  const [active, setActive] = useState<string | null>(null);
  const [submenu, setSubmenu] = useState<string | null>(null);
  const MENU_CSS = (configs?.MENU_CSS as Record<string, string>) ?? {};
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let prevY = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsVisible(currentY <= prevY || currentY <= 0);
      prevY = currentY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={cn(
        "flex gap-4 items-center bg-[#D9C6B6] fixed w-full top-[var(--header-height)] z-[49] transition-all duration-300",
        !isVisible && "-translate-y-full"
      )}
    >
      <div className="container flex items-center max-sm:hidden h-[var(--header-menu-height)]">
        <Menu setActive={setActive} className="flex-1 justify-start">
          {categoriesTree?.map((category) => {
            const index = category.index;
            if (!category.isShow) return null;
            const customCss = MENU_CSS[category.slug];
            if (!category.children.length)
              return (
                <Link
                  key={category._id}
                  href={category.slug ? `/danh-muc/${category.slug}` : "#"}
                  style={{
                    order: index ? index : categoriesTree.length,
                  }}
                >
                  <Button
                    onMouseEnter={() => setActive(null)}
                    variant="ghost"
                    className={cn(
                      "justify-start w-full text-base rounded-none",
                      customCss
                    )}
                    style={{
                      background: category.backgroundColor,
                      color: category.textColor,
                    }}
                  >
                    {category.name}
                  </Button>
                </Link>
              );
            return (
              <MenuItem
                key={category._id}
                setActive={setActive}
                active={active}
                item={category.name}
                style={{
                  order: index ? index : categoriesTree.length,
                }}
                menuTrigger={
                  <Link
                    href={category.slug ? `/danh-muc/${category.slug}` : "#"}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "text-base !bg-cover !bg-center rounded-none",
                        customCss
                      )}
                      style={{
                        background: category.backgroundColor,
                        color: category.textColor,
                      }}
                    >
                      {category.name}
                      <ChevronDown
                        size={16}
                        className={cn(
                          "ml-[2px] transition-all ease-linear",
                          category.name === active ? "-rotate-90" : ""
                        )}
                      />
                    </Button>
                  </Link>
                }
                className={cn("flex flex-col text-lg")}
              >
                {!!category.children.length ? (
                  category.children.map((child) => {
                    const childIndex = child.index;
                    const customCss = MENU_CSS[child.slug || ""];
                    if (!child.children.length)
                      return (
                        <Link
                          key={child.id}
                          href={child.slug ? `/danh-muc/${child.slug}` : "#"}
                          style={{
                            order: childIndex
                              ? childIndex
                              : category.children.length,
                          }}
                        >
                          <Button
                            variant="ghost"
                            className={cn(
                              "justify-start pl-2 w-full min-w-[100px]",
                              customCss
                            )}
                          >
                            {child.name}
                          </Button>
                        </Link>
                      );
                    return (
                      <SubMenuItem
                        key={child.id}
                        active={submenu}
                        setActive={setSubmenu}
                        item={child.name}
                        className={cn("flex flex-col z-10")}
                        style={{
                          order: childIndex
                            ? childIndex
                            : category.children.length,
                        }}
                        subMenuTrigger={
                          <Link
                            href={child.slug ? `/danh-muc/${child.slug}` : "#"}
                          >
                            <Button
                              variant="ghost"
                              className={cn(
                                "flex w-full justify-between px-2 min-w-[120px]",
                                customCss
                              )}
                            >
                              {child.name}
                              <ChevronRight size={16} className="ml-4" />
                            </Button>
                          </Link>
                        }
                      >
                        {child.children.map((subChild) => {
                          const customCss = MENU_CSS[subChild.slug || ""];
                          return (
                            <Link
                              key={subChild.id}
                              href={
                                subChild.slug
                                  ? `/danh-muc/${subChild.slug}`
                                  : "#"
                              }
                            >
                              <Button
                                variant="ghost"
                                className={cn(
                                  "justify-start pl-2 w-full",
                                  customCss
                                )}
                              >
                                {subChild.name}
                              </Button>
                            </Link>
                          );
                        })}
                      </SubMenuItem>
                    );
                  })
                ) : (
                  <Link
                    href={category.slug ? `/danh-muc/${category.slug}` : "#"}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "justify-start",
                        index !== -1 && `order-[${index}]`,
                        customCss
                      )}
                      style={{
                        background: category.backgroundColor,
                      }}
                    >
                      {category.name}
                    </Button>
                  </Link>
                )}
              </MenuItem>
            );
          })}
        </Menu>
        <HeaderSearch />
      </div>
    </div>
  );
}

export const HeaderMenuSkeleton = () => {
  return (
    <div className="flex flex-1 gap-4 items-center">
      <div className="w-20 h-10 bg-gray-50/50 rounded-lg" />
      <div className="w-20 h-10 bg-gray-50/50 rounded-lg" />
      <div className="w-28 h-10 bg-gray-50/50 rounded-lg" />
      <div className="w-28 h-10 bg-gray-50/50 rounded-lg" />
      <div className="w-20 h-10 bg-gray-50/50 rounded-lg" />
      <div className="w-16 h-10 bg-gray-50/50 rounded-lg" />
      <div className="w-24 h-10 bg-gray-50/50 rounded-lg" />
    </div>
  );
};
