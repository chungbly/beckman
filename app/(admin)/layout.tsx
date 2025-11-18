import localFont from "next/font/local";
const poppins = localFont({
  src: [
    {
      path: "../../public/fonts/geist/Geist-Regular.ttf",
      weight: "400",
    },
    {
      path: "../../public/fonts/geist/Geist-Medium.ttf",
      weight: "500",
    },
    {
      path: "../../public/fonts/geist/Geist-SemiBold.ttf",
      weight: "600",
    },
    {
      path: "../../public/fonts/geist/Geist-Bold.ttf",
      weight: "700",
    },
    {
      path: "../../public/fonts/geist/Geist-ExtraBold.ttf",
      weight: "800",
    },
    {
      path: "../../public/fonts/geist/Geist-Black.ttf",
      weight: "900",
    },
    {
      path: "../../public/fonts/geist/Geist-Light.ttf",
      weight: "300",
    },
    {
      path: "../../public/fonts/geist/Geist-Thin.ttf",
      weight: "100",
    },
  ],
  variable: "--font-geist",
});

import { AppSidebar } from "@/components/app-layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getGlobalConfig } from "@/lib/configs";
import { getAccessToken } from "@/lib/cookies";
import { cn } from "@/lib/utils";
import { getUserAdminQuery } from "@/query/auth.admin.query";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Metadata } from "next";
import { cookies } from "next/headers";
import MainContent from "./main-content";

export const metadata: Metadata = {
  openGraph: {
    images: ["/favicon.png"],
  },
  metadataBase: new URL("https://beckman.vn"),
  icons: {
    icon: "/favicon.png",
  },
  description: "Beckman - Be a Classic Gentleman",
  title: "Beckman - Be a Classic Gentleman",
  appleWebApp: {},
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  const token = (await getAccessToken())?.value;
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(getUserAdminQuery);

  const configs = await getGlobalConfig();
  return (
    <div
      className={cn(
        "min-h-screen bg-background antialiased",
        poppins.className
      )}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar configs={configs} />
          <MainContent token={token}>{children}</MainContent>
        </SidebarProvider>
      </HydrationBoundary>
    </div>
  );
}
