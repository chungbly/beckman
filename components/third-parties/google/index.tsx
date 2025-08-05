"use client";

import { useEffect } from "react";
import { useConfigs } from "@/store/useConfig";

export default function GoogleTagManagers() {
  const configs = useConfigs((s) => s.configs);
  const GG_TAG_MANAGER_IDS = (configs?.["GG_TAG_MANAGER_IDS"] || []) as string[];

  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;
    if (GG_TAG_MANAGER_IDS.length === 0) return;

    const loadGTM = () => {
      GG_TAG_MANAGER_IDS.forEach((id) => {
        if (document.getElementById(`gtm-${id}`)) return;

        const script = document.createElement("script");
        script.id = `gtm-${id}`;
        script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
        script.async = true;
        document.head.appendChild(script);
      });
    };

    // Gọi sau khi user có tương tác
    const handler = () => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(loadGTM);
      } else {
        setTimeout(loadGTM, 2000);
      }
      window.removeEventListener("scroll", handler);
    };

    window.addEventListener("scroll", handler, { once: true });
    return () => window.removeEventListener("scroll", handler);
  }, [GG_TAG_MANAGER_IDS]);

  return null;
}
