import { CustomPage } from "@/app/(admin)/admin/ui/layout-editor/container";
import { Meta } from "@/types/api-response";
import { Product } from "@/types/product";
import { Redirect } from "@/types/redirect";
import { StaticHTML } from "@/types/static-html";
import { APIResponse, APIStatus, callAPI } from "./callAPI";

interface RedirectWithMeta {
  items: Redirect[];
  meta: Meta;
}

type TypeQuery = true | false;

type ObjectType<T> = T extends true
  ? RedirectWithMeta
  : T extends false
  ? Product[]
  : never;

export const getRedirects = async <T extends TypeQuery>(
  query: {
    rootUrl?: string;
    destinationUrl?: string;
  },
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  return await callAPI<ObjectType<T>>(`/api/redirects`, {
    query: {
      q: JSON.stringify(query),
      limit,
      page,
      getTotal,
    },
  });
};

export const createRedirect = async (data: Partial<Redirect>) => {
  return await callAPI<Redirect>(`/api/redirects`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateRedirect = async (id: string, data: Partial<Redirect>) => {
  return await callAPI<Redirect>(`/api/redirects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deleteRedirects = (ids: string[]) => {
  return callAPI("/api/redirects", {
    method: "DELETE",
    query: {
      ids,
    },
  });
};

export const getRedirectsWithCache = async () => {
  try {
    const result = await fetch(
      `${process.env.NEXT_PUBLIC_WEB_URL}/api/redirects`,
      {
        cache: "force-cache",
        next: {
          revalidate: 5 * 60,
        },
      }
    );
    const res = (await result.json()) as unknown as APIResponse<{
      redirects: Redirect[];
      staticHTMLs: StaticHTML[];
      pages: CustomPage[];
    }>;
    if (res.status !== APIStatus.OK || !res.data)
      return {} as {
        redirects: Redirect[];
        staticHTMLs: StaticHTML[];
        pages: CustomPage[];
      };
    return res.data;
  } catch (e) {
    console.log("fetching redirectsWithCache error", JSON.stringify(e));
    return {} as {
      redirects: Redirect[];
      staticHTMLs: StaticHTML[];
      pages: CustomPage[];
    };
  }
};
