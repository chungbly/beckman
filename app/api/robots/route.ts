export const dynamic = "force-dynamic";
import { APIStatus } from "@/client/callAPI";
import { getConfigs } from "@/client/configs.client";
import { NextResponse } from "next/server";

export const GET = async () => {
  const robotsTxtDefault = `# *
User-agent: *
Disallow: /admin

# *
User-agent: *
Allow: /

# Host
Host: https://beckman.vn/

# Sitemaps
Sitemap: https://beckman.vn/sitemap.xml
Sitemap: https://beckman.vn/server-sitemap.xml
`;
  try {
    const res = await getConfigs();

    if (res.status !== APIStatus.OK || !res.data?.length) {
      return new NextResponse(robotsTxtDefault, {
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    const robotsTxt = res.data.find((config) => config.key === "ROBOTS")?.value;
    if (!robotsTxt) {
      return new NextResponse(robotsTxtDefault, {
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }
    return new NextResponse(robotsTxt, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (e) {
    return new NextResponse(robotsTxtDefault, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
};
