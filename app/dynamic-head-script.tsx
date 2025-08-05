import { APIStatus } from "@/client/callAPI";
import { getEmbeds } from "@/client/embed.client";
import { EmbedPosition } from "@/types/embed";
import { headers } from "next/headers";

export default async function DynamicScript() {
  if(process.env.NODE_ENV === "development") return;
  const headersList = await headers();
  const pathname = headersList.get("x-pathname");
  if (pathname?.includes("admin")) return;
  const res = await getEmbeds({}, 100, 1, false);
  if (res.status !== APIStatus.OK || !res.data) return;
  const embeds = res.data;
  const headScripts = embeds.filter((e) => e.position === EmbedPosition.HEAD && e.isActive);
  if (!headScripts.length) return;
  return (
    <head
      dangerouslySetInnerHTML={{
        __html: headScripts.map((embed) => embed.code).join("\n"),
      }}
    />
  );
}
