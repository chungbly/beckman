import { callAPI } from "./callAPI";

export const getIntroduces = async () => {
  const data = await callAPI("/v3/api/introduce?limit=20", {
    next: {
      revalidate: 0,
    },
  });
  return data;
};
