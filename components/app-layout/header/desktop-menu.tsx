"use client";

import { CategoryTree } from "@/app/(admin)/admin/categories/container";
import { getChildCategories } from "@/app/(admin)/admin/categories/page";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, SubMenuItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";
import { useConfigs } from "@/store/useConfig";
import { Category } from "@/types/category";
import { ChevronDown, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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

  return (
    <Menu setActive={setActive} className="flex-1 justify-end max-sm:hidden">
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
                  "hover:bg-transparent hover:text-[var(--brown-brand)] justify-start w-full rounded-none text-[var(--brown-brand)] uppercase text-xl font-bold",
                  customCss
                )}
                style={{
                  ...(category.backgroundColor && {
                    background: category.backgroundColor,
                  }),
                  ...(category.textColor && { color: category.textColor }),
                }}
              >
                {category.name}
              </Button>
            </Link>
          );

        const group = category.children.reduce((acc, cur) => {
          const groupName = cur.groupName || "";
          if (acc[groupName]) {
            acc[groupName].push(cur);
          } else {
            acc[groupName] = [cur];
          }
          return acc;
        }, {} as Record<string, CategoryTree[]>);
        console.log("group", group);
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
              <Link href={category.slug ? `/danh-muc/${category.slug}` : "#"}>
                <Button
                  variant="ghost"
                  className={cn(
                    "!bg-cover !bg-center rounded-none text-[var(--brown-brand)] uppercase text-xl font-bold",
                    customCss,
                    "hover:bg-transparent hover:text-[var(--brown-brand)]"
                  )}
                  style={{
                    ...(category.backgroundColor && {
                      background: category.backgroundColor,
                    }),
                    ...(category.textColor && { color: category.textColor }),
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
            className={cn(
              "grid grid-cols-5 w-screen container mx-auto h-[460px] items-center py-[40px]"
            )}
          >
            <div className="col-span-3 flex self-start gap-[20px]">
              {!!category.children.length ? (
                Object.keys(group).map((g) => {
                  const childs = group[g];
                  return (
                    <div key={g} className="text-xl flex flex-col gap-[10px]">
                      {g && (
                        <p className="uppercase text-[var(--brown-brand)] font-bold">
                          {g}
                        </p>
                      )}
                      {childs.map((child) => {
                        const childIndex = child.index;
                        const customCss = MENU_CSS[child.slug || ""];
                        if (!child.children.length)
                          return (
                            <Link
                              key={child.id}
                              href={
                                child.slug ? `/danh-muc/${child.slug}` : "#"
                              }
                              className="text-[#777777] hover:underline"
                              style={{
                                order: childIndex
                                  ? childIndex
                                  : category.children.length,
                              }}
                            >
                              {child.name}
                            </Link>
                          );
                        return (
                          <SubMenuItem
                            key={child.id}
                            active={submenu}
                            setActive={setSubmenu}
                            item={child.name}
                            className={cn(
                              "flex flex-col z-10 text-[var(--brown-brand)] uppercase"
                            )}
                            style={{
                              order: childIndex
                                ? childIndex
                                : category.children.length,
                            }}
                            subMenuTrigger={
                              <Link
                                href={
                                  child.slug ? `/danh-muc/${child.slug}` : "#"
                                }
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
                      })}
                    </div>
                  );
                })
              ) : (
                <Link href={category.slug ? `/danh-muc/${category.slug}` : "#"}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "justify-start text-[var(--brown-brand)] uppercase",
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
            </div>
            <div className="col-span-2 relative h-[350px]">
              {category.desktopBanner && (
                <Image
                  src={category.desktopBanner}
                  alt={category.name}
                  fill
                  sizes="800px"
                  priority
                />
              )}
            </div>
          </MenuItem>
        );
      })}
    </Menu>
  );
}
