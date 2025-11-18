import { Oswald } from "next/font/google";

import AppLayout from "@/components/app-layout";
import InitCookies from "@/components/app-layout/init-cookies";
import FacebookPixel from "@/components/third-parties/facebook";
import GoogleTagManagers from "@/components/third-parties/google";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import DynamicClientScript from "../dynamic-client-script";
import { Toaster } from "@/components/ui/sonner";

const oswald = Oswald({
  weight: ["300", "400", "500", "700"],
  style: ["normal"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

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
  return (
    <div
      className={cn(
        "min-h-screen bg-[url('/images/background.png')] bg-cover bg-repeat-round font-inter antialiased",
        oswald.className
      )}
    >
      <InitCookies />
      <AppLayout>{children}</AppLayout>
      <FacebookPixel />
      <DynamicClientScript />
      <GoogleTagManagers />
      <Toaster
        duration={10000}
        position="top-right"
        expand
        className="bg-transparent min-w-auto"
      />
    </div>
  );
}
