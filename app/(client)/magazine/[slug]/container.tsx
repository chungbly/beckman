"use client";
import { useEffect } from "react";

function MagazineDetailContainer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const headerContainer = document.querySelector(
      "#header-container"
    ) as HTMLElement;
    if (!headerContainer) return;
    const maxWidth = window.getComputedStyle(headerContainer).maxWidth;
    if (maxWidth === "1400px") {
      headerContainer.classList.add("max-w-[1220px]");
    }

    return () => {
      headerContainer.classList.remove("max-w-[1220px]");
    };
  }, []);
  return children;
}

export default MagazineDetailContainer;
