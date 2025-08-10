import React from "react";
import CartSyncerSever from "./cart-syncer/server";
import Footer from "./footer";
import Header from "./header";

interface Props {
  children: React.ReactNode;
}

async function AppLayout({ children }: Props) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <CartSyncerSever />
    </>
  );
}

export default AppLayout;
