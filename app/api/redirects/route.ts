import { CustomPage } from "@/app/(admin)/admin/ui/layout-editor/container";
import { APIStatus, callAPI } from "@/client/callAPI";
import { Configs } from "@/types/configs";
import { Redirect } from "@/types/redirect";
import { StaticHTML } from "@/types/static-html";
import { NextResponse } from "next/server";

export async function GET() {
  const [resRedirects, resConfigs, resStaticHTML] = await Promise.all([
    callAPI<Redirect[]>(`/api/redirects`, {
      query: {
        q: JSON.stringify({
          isActive: true,
        }),
      },
    }),
    callAPI<Configs[]>(`/api/configs`),
    callAPI<StaticHTML[]>(`/api/static-html`, {
      query: {
        q: JSON.stringify({
          isActive: true,
        }),
      },
    }),
  ]);
  const redirects = resRedirects.data || [];
  const staticHTMLs = resStaticHTML.data || [];
  const configs = resConfigs.data?.reduce((acc, cur) => {
    try {
      acc[cur.key] = JSON.parse(cur.value);
      return acc;
    } catch (e) {
      acc[cur.key] = cur.value;
      return acc;
    }
  }, {} as Record<string, unknown>);
  const PAGE_MANAGER = (configs?.["PAGE_MANAGER"] as CustomPage[]) || [];
  const data = {
    redirects,
    staticHTMLs,
    pages: PAGE_MANAGER,
  };
  const response = NextResponse.json({
    status: APIStatus.OK,
    data,
    message: "Get redirects from server",
  });

  response.headers.set(
    "Cache-Control",
    "s-maxage=300, stale-while-revalidate=59"
  );

  return response;
}
