"use client";
import { useEffect, useRef, useState } from "react";

function FacebookIframe() {
  const [width, setWidth] = useState(300);
  const containerRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);
  return (
    <iframe
      ref={containerRef}
      // src={`https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FR8ckie&tabs=timeline&width=${width}&height=130&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`}
      src={
        "https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fbeckmanvietnam&tabs=timeline&width=300&height=130&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
      }
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      className="overflow-hidden border-0 w-full h-[150px] sm:h-auto"
    />
  );
}

export default FacebookIframe;
