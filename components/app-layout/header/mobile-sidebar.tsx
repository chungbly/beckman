"use client";

import {
  CategoryTree,
  getChildCategories,
} from "@/app/(admin)/admin/categories/container";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useConfigs } from "@/store/useConfig";
import { Category } from "@/types/category";
import { Customer } from "@/types/customer";
import { ChevronDown, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import LoginDialog from "../login-form-dialog";

interface MenuItem extends CategoryTree {
  icon?: string;
}
export function MobileSidebar({
  categories,
  handleClose,
  customer,
}: {
  categories: Category[];
  handleClose: () => void;
  customer?: Customer | null;
}) {
  const configs = useConfigs((s) => s.configs);
  const menuIcons = configs?.MENU_ICONS as Record<string, string>;
  const MOBILE_MENU_CSS = configs["MOBILE_MENU_CSS"] as Record<string, string>;

  const menuItems =
    categories
      ?.filter((c) => !c.parentId)
      ?.map((category) => {
        return {
          ...category,
          icon: menuIcons[category.seo?.slug || ""],
          children:
            getChildCategories(
              categories as unknown as CategoryTree[],
              category._id
            ) ?? [],
        };
      }) || [];

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="icon-footprints w-4 h-4" />
      <ScrollArea className="flex-1">
        <div className="p-1 flex flex-col gap-1">
          {menuItems.map((item, index) => {
            const categoryIndex = item.index;
            const css = MOBILE_MENU_CSS?.[item.seo?.slug!] || "";
            return (
              <MenuItem
                handleClose={handleClose}
                key={index}
                item={{ ...item, id: item._id }}
                className={css}
                style={{
                  order: categoryIndex ? categoryIndex : menuItems.length,
                }}
              />
            );
          })}
          {[
            {
              name: "Magazine",
              slug: "/magazine",
            },
            {
              name: "About",
              slug: "/gioi-thieu",
            },
          ].map((item, index) => (
            <Button
              key={index + item.name}
              variant="ghost"
              className={cn("w-full justify-start gap-2 order-[99]")}
              asChild
              onClick={handleClose}
            >
              <Link className={cn("pl-1")} href={`${item.slug!}`}>
                <span className="font-bold uppercase">{item.name}</span>
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>
      {!customer && (
        <div className="p-1 border-t">
          <LoginDialog>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/auth">
                <LogIn className="h-4 w-4" />
                Đăng nhập/Đăng ký
              </Link>
            </Button>
          </LoginDialog>
        </div>
      )}
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
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} style={style}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between pl-1 font-bold uppercase focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0",
              isOpen && "bg-muted",
              className
            )}
          >
            <span className="flex items-center gap-2">
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
              {/* {item.badge && (
                <Badge variant="secondary" className="ml-2">
                  {item.badge}
                </Badge>
              )} */}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className=" gap-1 px-4 pl-1 py-2">
          <div className="flex flex-col">
            {item.children.map((child, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start  hover:text-foreground"
                asChild
                onClick={handleClose}
                style={{
                  order: child.index || item.children.length,
                }}
              >
                <Link href={`/danh-muc/${child.slug!}`}>{child.name}</Link>
              </Button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Button
      variant="ghost"
      className={cn("w-full justify-start uppercase font-bold gap-2")}
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
  );
}
