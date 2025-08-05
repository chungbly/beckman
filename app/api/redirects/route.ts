import { APIStatus, callAPI } from "@/client/callAPI";
import { Redirect } from "@/types/redirect";
import { StaticHTML } from "@/types/static-html";
import { NextResponse } from "next/server";

export async function GET() {
  const [resRedirects, resStaticHTML] = await Promise.all([
    callAPI<Redirect[]>(`/api/redirects`, {
      query: {
        q: JSON.stringify({
          isActive: true,
        }),
      },
    }),
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
  const data = {
    redirects,
    staticHTMLs,
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
