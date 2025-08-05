import { getRefreshToken } from "@/lib/cookies";
import { AdminUser } from "@/types/user";
import { callAPI } from "./callAPI";

export const getUser = async () => {
  return await callAPI<AdminUser>("/api/auth/admin/profile");
};

export const refreshToken = async () => {
  const refreshToken = await getRefreshToken();
  return await callAPI<{
    accessToken: string;
  }>("/api/auth/admin/refresh", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken?.value}`,
    },
  });
};
