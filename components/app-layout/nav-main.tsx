"use client";

import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavMainItem } from "./app-sidebar";

export function NavMain({ items }: { items: NavMainItem[] }) {
  const { toggleSidebar, open } = useSidebar();
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = item.items?.length
            ? item.items?.some((subItem) => {
                return subItem.url === pathname;
              })
            : (pathname.startsWith(item.url) || item.url === pathname);
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {!!item.items?.length ? (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      onClick={() => {
                        if (!open) {
                          toggleSidebar();
                        }
                      }}
                      className={cn(
                        "transition-all overflow-hidden hover:bg-gray-200 hover:text-primary relative  group/menu-btn",
                        isActive
                          ? "text-primary bg-gray-200 data-[state=open]:bg-transparent"
                          : ""
                      )}
                    >
                      {isActive && (
                        <span className="group-data-[state=open]/menu-btn:block hidden w-1 h-[80%] absolute left-0 top-0 translate-y-[15%] bg-primary rounded-lg" />
                      )}
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>

                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                ) : (
                  <Link href={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={cn(
                        "hover:bg-gray-200 hover:text-primary transition-all",
                        isActive && "text-primary bg-gray-200"
                      )}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                )}

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubmenuActive = subItem.url === pathname;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              href={subItem.url}
                              className={cn(
                                "hover:bg-gray-200 hover:text-primary transition-all",
                                isSubmenuActive && "!text-primary bg-gray-200"
                              )}
                            >
                              {subItem.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
