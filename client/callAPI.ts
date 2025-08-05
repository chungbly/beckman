import { getAccessToken } from "@/lib/cookies";
import tokenStore from "@/store/tokenStore";

export enum APIStatus {
  OK = "OK",
  INVALID = "INVALID",
  SERVER_ERROR = "SERVER_ERROR",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  BAD_REQUEST = "BAD_REQUEST",
  CONFLICT = "CONFLICT",
}
export enum APIMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export interface APIResponse<T> {
  message: string;
  data: T | null;
  status: APIStatus;
}

export const callAPI = async <T>(
  url: string,
  options?: RequestInit & {
    baseURL?: string;
    query?: Record<string, any>;
    headers?: Record<string, string>;
  }
): Promise<APIResponse<T>> => {
  try {
    const { baseURL, query, ...rest } = options ?? {};
    const URL: string = `${
      options?.baseURL
        ? options.baseURL
        : typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_API_HOST_URL
        : "/backend"
    }${url}${
      options?.query ? "?" + new URLSearchParams(options.query).toString() : ""
    }`;
    let token = "";
    // getAccessToken là server fuction, gọi trực tiếp từ client sẽ dẫn đến bug crash css page ngẫu nhiên
    if (typeof window === "undefined") {
      token = (await getAccessToken())?.value || "";
    } else {
      token = tokenStore.getState().token;
    }
    const res = await fetch(URL, {
      method: options?.method || APIMethod.GET,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      next: {
        revalidate: 0,
      },
      ...rest,
    });

    const data: APIResponse<T> = await res.json();
    return data;
  } catch (e: any) {
    return {
      message: e?.message,
      data: null,
      status: APIStatus.SERVER_ERROR,
    };
  }
};
