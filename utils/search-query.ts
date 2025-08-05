import { ReadonlyURLSearchParams } from "next/navigation";

export const createQueryString = (
  searchParams: ReadonlyURLSearchParams,
  query: Record<string, string | string[] | number | number[] | undefined>
) => {
  const params = new URLSearchParams(searchParams.toString());
  Object.entries(query).forEach(([name, value]) => {
    if (value) {
      params.set(
        name,
        Array.isArray(value) ? value.join(",") : value.toString()
      );
    } else {
      params.delete(name);
    }
  });
  // @ts-ignore
  for (const [key, value] of params.entries()) {
    if (value?.trim() === "") {
      params.delete(key);
    }
  }

  return params.toString();
};

export const serialize = (obj: Record<string, any>) =>
  Object.entries(obj)
    .map(([key, val]) => `${key}=${val}`)
    .join("&");

export const resetFilter = () => {
  const { pathname, origin } = window.location;
  window.location.replace(`${origin}${pathname}`);
};
