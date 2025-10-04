import dynamic from "next/dynamic";
import React from "react";
import CartSyncerSever from "./cart-syncer/server";
import Footer from "./footer";
import Header from "./header";
const MobileActionBar = dynamic(() => import("./footer/mobile-actionbar"));

interface Props {
  children: React.ReactNode;
}

async function AppLayout({ children }: Props) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <MobileActionBar />
      <CartSyncerSever />
    </>
  );
}

export default AppLayout;
