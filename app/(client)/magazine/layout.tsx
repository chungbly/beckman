import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { Lora } from "next/font/google";
import React from "react";

export const metadata: Metadata = {
  title: "Beckman Magazine",
  description: "Beckman - Magazine",
  keywords:
    "Beckman, giay, dep, giam them, discount, magazine, tap-chi, huong-dan",
};
const lora = Lora({
  weight: ["400", "500", "700"],
  style: ["normal"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(lora.className, "text-[var(--brown-brand)] mt-4 sm:mt-12")}
    >
      {children}
    </div>
  );
}

export default Layout;
