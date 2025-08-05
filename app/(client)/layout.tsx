import { Roboto } from "next/font/google";

import AppLayout from "@/components/app-layout";
import InitCookies from "@/components/app-layout/init-cookies";
import FacebookPixel from "@/components/third-parties/facebook";
import GoogleTagManagers from "@/components/third-parties/google";
import { getUserId } from "@/lib/cookies";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import DynamicClientScript from "../dynamic-client-script";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  openGraph: {
    images: ["/favicon.png"],
  },
  metadataBase: new URL("https://r8ckie.com"),
  icons: {
    icon: "/favicon.png",
  },
  description: "R8ckie Step on your way",
  title: "R8ckie - Step on your way",
  appleWebApp: {},
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getUserId();
  return (
    <div
      className={cn(
        "min-h-screen bg-background font-inter antialiased",
        roboto.className
      )}
    >
      <InitCookies userId={userId} />
      <AppLayout>{children}</AppLayout>
      <FacebookPixel />
      <DynamicClientScript />
      <GoogleTagManagers />
    </div>
  );
}
