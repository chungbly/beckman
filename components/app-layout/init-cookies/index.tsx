"use client";
import { APIStatus, callAPI } from "@/client/callAPI";
import { useCustomerStore } from "@/store/useCustomer";
import { useEffect } from "react";
import { v4 } from "uuid";

function InitCookies({ userId }: { userId?: string }) {
  useEffect(() => {
    const initCookies = async () => {
      if (!userId) {
        try {
          const newUserId = v4();
          const res = await callAPI("/api/cookies", {
            baseURL: process.env.NEXT_PUBLIC_WEB_URL,
            method: "POST",
            body: JSON.stringify({
              userId: newUserId,
            }),
          });
          if (res.status === APIStatus.OK) {
            useCustomerStore.setState({
              userId: newUserId,
            });
          }
        } catch (e) {
          console.log("init cookies error", JSON.stringify(e));
        }
      }
    };
    if (!userId) {
      initCookies();
    } else {
      useCustomerStore.setState({
        userId,
      });
    }
  }, [userId]);

  return null;
}

export default InitCookies;
