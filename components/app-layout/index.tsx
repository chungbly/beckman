import { APIStatus } from "@/client/callAPI";
import { getCategories } from "@/client/category.client";
import { isMobileServer } from "@/lib/isMobileServer";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import CartSyncerSever from "./cart-syncer/server";
import Footer from "./footer";
import Header from "./header";
import { HeaderMenuSkeleton } from "./header/desktop-menu";
const MobileActionBar = dynamic(() => import("./footer/mobile-actionbar"));
const HeaderMenu = dynamic(() =>
  import("./header/desktop-menu").then((mod) => mod.HeaderMenu)
);

interface Props {
  children: React.ReactNode;
}

const HeaderMenuWrapper = async () => {
  const isMobile = await isMobileServer();
  const res = await getCategories({
    status: true,
  });
  if (res.status !== APIStatus.OK) return [];
  const categories = res.data!.map((category) => ({
    ...category,
    slug: category.seo?.slug,
    id: category._id,
  }));

  return (
    <>
      <Header />
      {!isMobile && <HeaderMenu categories={categories} />}
    </>
  );
};

async function AppLayout({ children }: Props) {
  return (
    <>
      <Suspense fallback={<HeaderMenuSkeleton />}>
        <HeaderMenuWrapper />
      </Suspense>
      {children}
      <Footer />
      <MobileActionBar />
      <CartSyncerSever />
    </>
  );
}

export default AppLayout;
