"use client";
import { CollectionMenu as TCollectionMenu } from "@/app/(admin)/admin/ui/collections/container";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

function CollectionMenu({ menus }: { menus: TCollectionMenu[] }) {
  const [active, setActive] = React.useState<string | null>(null);
  return (
    <Menu setActive={setActive} className="hidden sm:block">
      <MenuItem
        setActive={setActive}
        active={active}
        item={"Collection"}
        menuTrigger={
          <Button
            variant="ghost"
            className={cn(
              "text-base !bg-cover !bg-center rounded-none text-white"
            )}
          >
            Collections
          </Button>
        }
        className={cn("flex flex-col text-lg max-h-[500px] overflow-y-auto")}
      >
        {!!menus.length &&
          menus.map((child, index) => {
            const isInternalLink = child.href.startsWith("/");
            if (isInternalLink) {
              return (
                <Link key={child.name + index} href={child.href || "#"}>
                  <Button
                    variant="ghost"
                    className={cn("justify-start pl-2 w-full min-w-[100px]")}
                  >
                    {child.name}
                  </Button>
                </Link>
              );
            }
            return (
              <a key={child.name + index} href={child.href}>
                <Button
                  variant="ghost"
                  className={cn("justify-start pl-2 w-full min-w-[100px]")}
                >
                  {child.name}
                </Button>
              </a>
            );
          })}
      </MenuItem>
    </Menu>
  );
}

export default CollectionMenu;
