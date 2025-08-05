import { callAPI } from "./callAPI";

export const logError = (error: string) => {
  return callAPI(`/api/log`, {
    method: "POST",
    body: JSON.stringify({
      message: error,
    }),
  });
};
