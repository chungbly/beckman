"use client";
import { APIStatus } from "@/client/callAPI";
import { getEmbeds } from "@/client/embed.client";
import { EmbedPosition } from "@/types/embed";
import { useEffect } from "react";

function DynamicClientScript() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const fetchScript = async () => {
      const res = await getEmbeds({}, 100, 1, false);
      if (res.status !== APIStatus.OK || !res.data) return;
      const embeds = res.data;
      const bodyScript = embeds.filter(
        (e) => e.position === EmbedPosition.BODY && e.isActive
      );
      if (!bodyScript.length) return;
      const body = document.querySelector("body");
      if (!body) return;
      bodyScript.forEach((d) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = d.code;
        const children = tempDiv.childNodes;
        for (let i = 0; i < children.length; i++) {
          const id = `script-${d._id}-${i}`;
          const isExist = document.querySelector(`script[data-id="${id}"]`);
          if (isExist) return;
          if (children[i].nodeName !== "SCRIPT" || !children[i]) return;
          const script = document.createElement("script");
          script.defer = true;
          script.setAttribute("data-id", id);
          script.innerHTML = children[i].textContent || "";
          body.appendChild(script);
        }
      });
    };
    fetchScript();
  }, []);

  return null;
}
export default DynamicClientScript;
