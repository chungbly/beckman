"use client";
import { getProducts } from "@/client/product.client";
import { cn } from "@/lib/utils";
import { useCustomerStore } from "@/store/useCustomer";
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import ProductScrollAbleList from "../jodit-editor/product-scrollable-list";

function RenderHTMLFromCMS({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef(null);
  const getProductList = async (ids: number[]) => {
    const userId =
      useCustomerStore.getState().customer?._id ||
      useCustomerStore.getState().userId ||
      "";
    const res = await getProducts(
      {
        ids,
        userId,
      },
      ids.length,
      1
    );
    if (!res || !res.data || res.status !== "OK") {
      return [];
    }
    return res.data;
  };
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const div = ref.current as HTMLDivElement;
    (async () => {
      const elements = div.querySelectorAll('[data-type="product-scrollable"]');
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const ids = JSON.parse(el.getAttribute("data-ids") || "[]");
        if (!ids?.length) return;
        const root = createRoot(el);
        const products = await getProductList(ids);
        root.render(
          <ProductScrollAbleList
            className={cn(
              "bg-[var(--rose-beige)] p-2 pt-4 max-w-[calc(100vw-2rem)]"
            )}
            products={products}
          />
        );
      }
    })();
  }, []);

  if (!html) return null;
  return (
    <div
      ref={ref}
      className={cn("prose prose-stone prose-compact max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default RenderHTMLFromCMS;
