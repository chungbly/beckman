import { callAPI } from "./callAPI";

export const getMagazines = async (page: number = 1, limit: number = 100) => {
  const data = await callAPI(
    `/v3/api/posts?fields=-content,-author1,-lastEdit1&page=${page}&limit=${limit}`,
    {
      next: {
        revalidate: 0,
      },
    }
  );
  return data
};
