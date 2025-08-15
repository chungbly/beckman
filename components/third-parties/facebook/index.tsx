"use client";

import { useEffect, useState } from "react";

import { useConfigs } from "@/store/useConfig";
import { useParams, usePathname } from "next/navigation";
import { pageview } from "../utils";

const FacebookPixel = () => {
  const [loaded, setLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const productSlug = params.productSlug;
  const configs = useConfigs((s) => s.configs);
  const PIXEL_IDS = (configs?.["PIXEL_IDS"] || []) as string[];

  function initializeFacebookPixel(
    f: any,
    b: Document,
    e: string,
    v: string,
    n?: any,
    t?: any,
    s?: any
  ) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  }

  useEffect(() => {
    if (!loaded || !initialized || productSlug) return;
    pageview();
  }, [pathname, loaded, productSlug]);

  useEffect(() => {
    if (loaded) {
      if (initialized) return;
      const loadFBPixel = () => {
        initializeFacebookPixel(
          window,
          document,
          "script",
          "https://connect.facebook.net/en_US/fbevents.js"
        );
        PIXEL_IDS.forEach((PIXEL_ID) => {
          window.fbq("init", PIXEL_ID);
        });
        setInitialized(true);
      };

      const handle = () => {
        if ("requestIdleCallback" in window) {
          requestIdleCallback(loadFBPixel);
        } else {
          setTimeout(loadFBPixel, 2000);
        }

        window.removeEventListener("scroll", handle);
      };

      window.addEventListener("scroll", handle, { once: true });

      return () => window.removeEventListener("scroll", handle);
    }

    setLoaded(true);
  }, [loaded, PIXEL_IDS, initialized]);
  return null;
};

export default FacebookPixel;
