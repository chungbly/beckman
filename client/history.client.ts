import { callAPI } from "./callAPI";

export const getHistories = async (page: number = 1, limit: number = 100) => {
  const data = await callAPI(
    `/v3/admin/api/histories?page=${!page ? 1 : page}&limit=${limit}`,
    {
      next: {
        revalidate: 0,
      },
    }
  );
  return data;
}
