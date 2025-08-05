import { Product } from "@/types/product";
import { sendGTMEvent } from "@next/third-parties/google";

declare global {
  interface Window {
    gtag: (config: any) => void;
  }
}

interface Item extends Product {
  quantity?: number;
}

export const ggTagTracking = (
  items: Item[],
  categoryName: string,
  eventName: string = "add_to_cart",
  value: number = 0
): void => {
  if (!window.gtag || typeof window.gtag !== "function") {
    sendGTMEvent({
      event: eventName,
      ecommerce: {
        items: items.map((item) => ({
          name: item.name,
          id: item.kvId,
          price: item.finalPrice,
          category: categoryName,
          color: item.color || "",
          size: item.size || "",
          quantity: item.quantity || 1,
        })),
        currency: "VND",
        value: value,
      },
    });
    return;
  }
  window.gtag({
    event: eventName,
    ecommerce: {
      items: items.map((item) => ({
        name: item.name,
        id: item.kvId,
        price: item.finalPrice,
        category: categoryName,
        color: item.color || "",
        size: item.size || "",
        quantity: item.quantity || 1,
      })),
      currency: "VND",
      value: value,
    },
  });
};

export const pageview = (): void => {
  window.fbq("track", "PageView");
};

export const fbTracking = (
  items: Item[],
  categoryName: string,
  eventName: string,
  value: number
): void => {
  if (typeof window.fbq !== "function") return;
  window.fbq("track", eventName, {
    contents: items.map((item) => ({
      name: item.name,
      id: item.kvId,
      price: item.finalPrice,
      category: categoryName,
      color: item.color || "",
      size: item.size || "",
      quantity: item.quantity || 1,
    })),
    currency: "VND",
    value: value,
    content_type: "product_group",
    content_ids: items.map((item) => item.kvId),
  });
};
