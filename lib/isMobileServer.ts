import { headers } from "next/headers";
import { cache } from "react";

export const isMobileServer = cache(async (): Promise<boolean> => {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  const isMobile = /mobile/i.test(userAgent || "");
  return isMobile;
});
