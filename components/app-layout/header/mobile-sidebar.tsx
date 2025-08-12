"use client";

import { CategoryTree } from "@/app/(admin)/admin/categories/container";
import { getChildCategories } from "@/app/(admin)/admin/categories/page";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useConfigs } from "@/store/useConfig";
import { Category } from "@/types/category";
import { Oswald } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
const oswald = Oswald({
  weight: ["300", "400", "500", "700"],
  style: ["normal"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
});
interface MenuItem extends CategoryTree {
  icon?: string;
}
export function MobileSidebar({
  categories,
  handleClose,
}: {
  categories: Category[];
  handleClose: () => void;
}) {
  const configs = useConfigs((s) => s.configs);
  const MOBILE_MENU_CSS = configs["MOBILE_MENU_CSS"] as Record<string, string>;
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
  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1" viewportClassName="p-0">
        <div className={cn("p-2 flex flex-col gap-[10px]", oswald.className)}>
          {categoriesTree.map((item, index) => {
            const categoryIndex = item.index;
            const css = MOBILE_MENU_CSS?.[item.seo?.slug!] || "";
            return (
              <MenuItem
                handleClose={handleClose}
                key={item._id}
                item={{ ...item, id: item._id }}
                className={cn(
                  "uppercase text-[var(--brown-brand)] font-bold text-xl",
                  css
                )}
                style={{
                  order: categoryIndex ? categoryIndex : categories.length,
                }}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function MenuItem({
  item,
  handleClose,
  className,
  style = {},
}: {
  item: MenuItem;
  handleClose: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  if (item.children?.length) {
    const group = item.children.reduce((acc, cur) => {
      const groupName = cur.groupName || "";
      if (!acc[groupName]) {
        acc[groupName] = [cur];
      } else {
        acc[groupName].push(cur);
      }
      return acc;
    }, {} as Record<string, MenuItem[]>);
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} style={style}>
        <div
          className={cn(
            "w-full py-[3px] flex h-[30px] pr-4 justify-between pl-1 font-bold uppercase focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0",
            isOpen && "bg-muted",
            "bg-transparent hover:bg-transparent hover:text-[var(--brown-brand)]",
            className
          )}
        >
          <Link
            href={item.slug ? `/danh-muc/${item.slug}` : "#"}
            className="flex flex-1 items-center gap-2"
            onClick={handleClose}
          >
            {item.icon && (
              <Image
                height={16}
                width={16}
                src={item.icon}
                alt={item.name}
                className="h-4 w-4"
              />
            )}
            {item.name}
          </Link>
          <CollapsibleTrigger className="w-[50px] flex items-center justify-end">
            <Image
              src="/icons/drop-down.svg"
              alt="chevron-down"
              width={8}
              height={8}
              className={cn(
                "h-2 w-2 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className=" data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown transition-all">
          <div className={cn("flex flex-col gap-[10px]")}>
            {Object.entries(group).map(([groupName, children]) => {
              if (!groupName) {
                return (
                  <div key={groupName} className="flex flex-col gap-[10px]">
                    {children.map((child, index) => (
                      <Button
                        key={child.id}
                        onClick={handleClose}
                        variant="ghost"
                        className="h-[30px] py-[3px] hover:text-[#777] w-full justify-start bg-transparent hover:bg-transparent text-xl font-normal text-[#777777] pl-[3px]"
                        asChild
                      >
                        <Link href={`/danh-muc/${child.slug!}`}>
                          {child.name}
                        </Link>
                      </Button>
                    ))}
                  </div>
                );
              }
              return (
                <Collapsible key={groupName}>
                  <CollapsibleTrigger asChild>
                    <div className="group/group-name flex items-center justify-between pr-4 mt-[10px]">
                      <Button
                        variant="ghost"
                        className="h-[30px] py-[3px] hover:text-[var(--brown-brand)] w-full justify-start bg-transparent uppercase hover:bg-transparent pl-[3px] text-xl text-[var(--brown-brand)] font-normal"
                      >
                        {groupName}
                      </Button>
                      <Image
                        src="/icons/drop-down.svg"
                        alt="chevron-down"
                        width={8}
                        height={8}
                        className={cn(
                          "h-2 w-2 transition-transform",
                          "group-data-[state=open]/group-name:rotate-180"
                        )}
                      />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown transition-all">
                    <div className="flex flex-col">
                      {children.map((child, index) => (
                        <Button
                          key={child.id}
                          onClick={handleClose}
                          variant="ghost"
                          className="hover:text-[#777] w-full justify-start bg-transparent hover:bg-transparent text-xl font-normal text-[#777777] pl-[3px]"
                          asChild
                        >
                          <Link href={`/danh-muc/${child.slug!}`}>
                            {child.name}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
            {item.mobileBanner && (
              <Image
                src={item.mobileBanner}
                alt={item.name}
                className="w-full aspect-[370/200] object-cover"
              />
            )}
          </div>
        </CollapsibleContent>
        <Separator className="mt-2" />
      </Collapsible>
    );
  }

  return (
    <div>
      <Button
        variant="ghost"
        className={cn(
          "w-full z-50 justify-start uppercase font-bold gap-2 py-[3px] h-[30px] bg-transparent hover:bg-transparent"
        )}
        asChild
        onClick={handleClose}
        style={style}
      >
        <Link className={cn("pl-1")} href={`/danh-muc/${item.slug!}`}>
          {item.icon && (
            <Image
              height={16}
              width={16}
              src={item.icon}
              alt={item.name}
              className="h-4 w-4"
            />
          )}
          <span className={className}>{item.name}</span>
          {/* {item.badge && (
          <Badge variant="secondary" className="ml-2">
            {item.badge}
          </Badge>
        )} */}
        </Link>
      </Button>
      <Separator className="mt-2" />
    </div>
  );
}
