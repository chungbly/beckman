"use client";
import { useCustomerStore } from "@/store/useCustomer";
import { useEffect } from "react";
import { v4 } from "uuid";

function InitCookies() {
  useEffect(() => {
    const userId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userId="))
      ?.split("=")[1];
    const initCookies = async () => {
      const newUserId = v4();
      document.cookie = `userId=${newUserId}; path=/; max-age=31536000`;
      useCustomerStore.setState({
        userId: newUserId,
      });
    };
    if (!userId) {
      initCookies();
    } else {
      useCustomerStore.setState({
        userId,
      });
    }
  }, []);

  return null;
}

export default InitCookies;
