"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ScrollToHash() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Đợi một chút để đảm bảo DOM đã render xong
    const timer = setTimeout(() => {
      const hash = window.location.hash;
      if (hash) {
        const elementId = hash.substring(1); // Bỏ dấu #
        const element = document.getElementById(elementId);
        if (element) {
          // Lấy header height từ CSS variable
          const root = document.documentElement;
          const isMobile = window.innerWidth < 640; // sm breakpoint
          const headerHeight = isMobile
            ? parseInt(
                getComputedStyle(root).getPropertyValue(
                  "--header-mobile-height"
                ) || "60"
              )
            : parseInt(
                getComputedStyle(root).getPropertyValue("--header-height") ||
                  "60"
              );

          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerHeight - 20; // Thêm 20px padding

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    }, 300); // Tăng delay để đảm bảo content đã load xong

    return () => clearTimeout(timer);
  }, [searchParams]); // Re-run khi searchParams thay đổi (khi filter tags)

  return null;
}

