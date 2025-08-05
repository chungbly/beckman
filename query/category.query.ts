import { APIStatus } from "@/client/callAPI";
import { getCategories, GetCategoryQuery } from "@/client/category.client";
import { queryOptions } from "@tanstack/react-query";

export const getCategoryQuery = queryOptions({
  queryKey: ["getCategories"],
  queryFn: async () => {
    const res = await getCategories();
    if (res.status !== APIStatus.OK || !res.data?.length) {
      return null;
    }

    const data = res.data;
    return data.map((category) => {
      return {
        ...category,
        slug: category.seo?.slug,
        id: category._id,
      };
    });
  },
});

export const getCategoriesQuery = (
  query: GetCategoryQuery,
  limit = 100,
  page = 1,
  getTotal = false
) => {
  return {
    queryKey: ["get-categories", query, limit, page, getTotal],
    queryFn: async () => {
      const res = await getCategories(query, limit, page, getTotal);
      if (res.status !== APIStatus.OK || !res.data?.length) {
        return null;
      }

      const data = res.data;
      return data.map((category) => {
        return {
          ...category,
          slug: category.seo?.slug,
          id: category._id,
        };
      });
    },
  };
};
