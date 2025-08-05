"use client";
import MainBreadCrumb from "@/components/app-layout/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import tokenStore from "@/store/tokenStore";
import { useEffect } from "react";

const MainContent = ({
  children,
  token,
}: {
  token?: string;
  children: React.ReactNode;
}) => {
  const sidebar = useSidebar();

  useEffect(() => {
    tokenStore.getState().setToken(token || "");
  }, [token]);
  return (
    <SidebarInset
      className={cn(
        "bg-neutral-100",
        sidebar.isMobile
          ? "max-w-full"
          : sidebar.state === "collapsed"
          ? "max-w-[calc(100%-var(--sidebar-width-icon))]"
          : "max-w-[calc(100%-var(--sidebar-width))]"
      )}
    >
      <header className="sticky bg-white/30 z-[49] backdrop-blur-sm top-0 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <MainBreadCrumb />
        </div>
      </header>
      {children}
    </SidebarInset>
  );
};
export default MainContent;
