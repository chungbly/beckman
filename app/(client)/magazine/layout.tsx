import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { Lora } from "next/font/google";
import React from "react";

export const metadata: Metadata = {
  title: "R8ckie Magazine",
  description: "R8ckie - Magazine",
  keywords:
    "R8ckie, giay, dep, giam them, discount, magazine, tap-chi, huong-dan",
};
const lora = Lora({
  weight: ["400", "500", "700"],
  style: ["normal"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(lora.className, "text-[var(--brown-brand)]")}>
      {children}
    </div>
  );
}

export default Layout;
