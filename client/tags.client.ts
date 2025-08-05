import { callAPI } from "./callAPI";

export const getTags = (keyword: string) => {
  return callAPI<
    {
      name: string;
    }[]
  >("/api/tags", {
    query: {
      q: JSON.stringify({
        name: keyword,
      }),
    },
  });
};
