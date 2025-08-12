import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "./client/authentication.client";
import { APIStatus } from "./client/callAPI";
import { getRedirectsWithCache } from "./client/redirect.client";
let redirectCache: {
  data: Awaited<ReturnType<typeof getRedirectsWithCache>>;
  expiresAt: number;
} | null = null;

const REDIRECT_CACHE_TTL = 1 * 30 * 1000;

async function getRedirectsCached() {
  const now = Date.now();
  if (!redirectCache || now > redirectCache.expiresAt) {
    const data = await getRedirectsWithCache();
    redirectCache = {
      data,
      expiresAt: now + REDIRECT_CACHE_TTL,
    };
  }
  return redirectCache.data;
}

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const pathname = request.nextUrl.pathname;
  requestHeaders.set("x-pathname", pathname);
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken");
    if (accessToken?.value) {
      const res = await getUser();
      if (res.status !== APIStatus.OK || !res?.data) {
        requestHeaders.set("x-pathname", "/admin/login");
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } else {
      requestHeaders.set("x-pathname", "/admin/login");
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } else {
    const {
      redirects = [],
      staticHTMLs = [],
      pages = [],
    } = await getRedirectsCached();

    const page = pages.find((p) => p.slug === pathname);
    console.log("page", page?.title);
    if (page && page.status === "published") {
      requestHeaders.set("x-pathname", page.id);

      return NextResponse.rewrite(new URL("/custom-page", request.url), {
        headers: requestHeaders,
      });
    }

    const redirectRule = redirects.find((r) => r.rootUrl === pathname);
    if (redirectRule) {
      if (redirectRule.destinationUrl.includes(".html")) {
        const staticHTML = staticHTMLs.find(
          (s) => s.name === redirectRule.destinationUrl
        );
        if (staticHTML) {
          return NextResponse.rewrite(
            new URL(`/static-html/${staticHTML.name}`, request.url)
          );
        }
      }
      return NextResponse.redirect(
        new URL(redirectRule.destinationUrl, request.url),
        302
      );
    }
    if (pathname.includes(".html")) {
      const staticHTML = staticHTMLs.find((s) => {
        return s.name === pathname.replace("/", "");
      });
      if (staticHTML) {
        return NextResponse.rewrite(
          new URL(`/static-html/${staticHTML.name}`, request.url)
        );
      }
    }
  }
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml).*)",
};
