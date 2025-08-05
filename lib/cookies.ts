"use server";
import { cookies } from "next/headers";

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken");
}

export async function setAccessToken(accessToken: string) {
  const cookieStore = await cookies();
  cookieStore.set("accessToken", accessToken);
}

export async function setUserId(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set("userId", userId);
}

export async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value || "";
}

export async function removeUserId() {
  const cookieStore = await cookies();
  cookieStore.delete("userId");
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get("refreshToken");
}

export async function removeAccessToken() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
}

export async function setCurrentFolderPath(path: string) {
  const cookieStore = await cookies();
  cookieStore.set("currentFolderPath", path);
}

export async function getCurrentFolderPath() {
  const cookieStore = await cookies();
  return cookieStore.get("currentFolderPath");
}
