import { getUser, refreshToken } from "@/client/authentication.client";
import { APIStatus, callAPI } from "@/client/callAPI";
import { redirect } from "next/navigation";

export const getUserAdminQuery = {
  queryKey: ["user-admin"],
  queryFn: async () => {
    const res = await getUser();
    if (res.status === APIStatus.UNAUTHORIZED) {
      const refreshRes = await refreshToken();
      if (refreshRes.status === APIStatus.OK && refreshRes.data?.accessToken) {
        try {
          const res = await callAPI("/api/cookies/set-token", {
            baseURL: process.env.NEXT_PUBLIC_WEB_URL,
            method: "POST",
            body: JSON.stringify({
              accessToken: refreshRes.data?.accessToken,
            }),
          });
          if (res.status === APIStatus.OK) {
            const resUser = await getUser();
            return resUser.data;
          }
        } catch (e) {
          console.log("set accessToken failed", JSON.stringify(e));
        }
      } else {
        try {
          await callAPI("/api/cookies/remove-token", {
            baseURL: process.env.NEXT_PUBLIC_WEB_URL,
            method: "POST",
          });
          if (typeof window !== "undefined") {
            window.location.replace("/admin/login");
          } else {
            redirect("/admin/login");
          }
        } catch (e) {
          console.log("remove accessToken failed", JSON.stringify(e));
        }
      }
    }
    return res.data;
  },
};
