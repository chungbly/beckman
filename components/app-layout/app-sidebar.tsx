"use client";

import { GalleryVerticalEnd, LucideIcon, Palette, Shirt } from "lucide-react";
import * as React from "react";

import {
  BookAudio,
  BookUser,
  ClipboardList,
  Contact,
  Folder,
  Newspaper,
  ReceiptText,
  ScanSearch,
  Settings,
  Ticket,
  UserCog,
} from "lucide-react";

import { SupportPage } from "@/app/(admin)/admin/policy/[url]/container";
import { NavMain } from "@/components/app-layout/nav-main";
import { NavUser } from "@/components/app-layout/nav-user";
import { TeamSwitcher } from "@/components/app-layout/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
export type NavMainItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  configs: Record<string, unknown>;
}) {
  const configs = props.configs;
  const DYNAMIC_SUPPORT_PAGE_LIST = configs?.[
    "DYNAMIC_SUPPORT_PAGE_LIST"
  ] as SupportPage;
  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: "R8ckie",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
    ],
    navMain: [
      {
        title: "Giao diện",
        icon: Palette,
        items: [
          {
            title: "Carousel",
            url: "/admin/ui/carousel",
          },
          {
            title: "Menu phụ",
            url: "/admin/ui/sub-menu",
          },
          {
            title: "Flash Deal",
            url: "/admin/ui/flash-deal",
          },
          {
            title: "Highlights",
            url: "/admin/ui/highlights",
          },
          {
            title: "Collections Menu",
            url: "/admin/ui/collections",
          },
          {
            title: "Khung hình",
            url: "/admin/ui/frames",
          },
        ],
      },
      {
        title: "Sản phẩm",
        icon: Shirt,
        url: "/admin/products",
      },
      {
        title: "Danh mục",
        url: "/admin/categories",
        icon: BookAudio,
      },
      {
        title: "Magazine",
        url: "/admin/magazines",
        icon: Newspaper,
      },
      {
        title: "Liên kết",
        url: "#",
        icon: Contact,
        items: [
          ...Object.keys(DYNAMIC_SUPPORT_PAGE_LIST).map((url) => ({
            title: DYNAMIC_SUPPORT_PAGE_LIST[url].name,
            url: `/admin/policy/${url}`,
          })),
          {
            title: "Liên hệ",
            url: "/admin/contact",
          },
        ],
      },
      {
        title: "File Manager",
        url: "/admin/file-manager",
        icon: Folder,
      },
      {
        title: "Cài đặt",
        url: "#",
        icon: Settings,
        items: [
          {
            title: "Sitemap",
            url: "/admin/settings/sitemaps",
          },
          {
            title: "Robot.txt",
            url: "/admin/settings/robots",
          },
          {
            title: "Redirects",
            url: "/admin/settings/redirects",
          },
          {
            title: "Embeds",
            url: "/admin/settings/embeds",
          },
          {
            title: "HTML tĩnh",
            url: "/admin/settings/static-html",
          },
          {
            title: "Configs",
            url: "/admin/settings/configs",
          },
        ],
      },
      {
        title: "Đơn hàng",
        url: "/admin/orders",
        icon: ReceiptText,
        items: [
          {
            title: "Danh sách đơn hàng",
            url: "/admin/orders",
          },
          {
            title: "Thống kê",
            url: "/admin/orders/statistics",
          },
        ],
      },
      {
        title: "Khách hàng",
        url: "/admin/customers",
        icon: BookUser,
      },
      {
        title: "Voucher",
        url: "/admin/vouchers",
        icon: Ticket,
      },
      {
        title: "User",
        url: "/admin/users",
        icon: UserCog,
      },
      {
        title: "Lịch sử",
        url: "/admin/audit-logs",
        icon: ClipboardList,
      },
      {
        title: "Search keywords",
        url: "/admin/search-setting",
        icon: ScanSearch,
      },
    ],
    // projects: [
    //   {
    //     name: "Design Engineering",
    //     url: "#",
    //     icon: Frame,
    //   },
    //   {
    //     name: "Sales & Marketing",
    //     url: "#",
    //     icon: PieChart,
    //   },
    //   {
    //     name: "Travel",
    //     url: "#",
    //     icon: Map,
    //   },
    // ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain as NavMainItem[]} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
