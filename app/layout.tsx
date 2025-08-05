export const dynamic = "force-dynamic";
import ScrollToTop from "@/components/app-layout/scroll-to-top";
import { getGlobalConfig } from "@/lib/configs";
import React from "react";
import "./globals.css";
import QueryProvider from "./providers";
import DynamicScript from "./dynamic-head-script";


async function RootLayout({ children }: { children: React.ReactNode }) {
  const configs = await getGlobalConfig();

  return (
    <html lang="vi" className="scroll-smooth">
      <DynamicScript />
      <body>
        <QueryProvider configs={configs}>
          {children}
          <ScrollToTop />
        </QueryProvider>
      </body>
    </html>
  );
}

export default RootLayout;
