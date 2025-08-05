import { APIStatus, callAPI } from "@/client/callAPI";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export async function POST(request: NextRequest, response: NextResponse) {
  const { email, password } = await request.json();
  let deviceId = request.headers.get("device-id");
  if (!deviceId) {
    deviceId = v4();
  }

  const res = await callAPI<{
    accessToken: string;
    refreshToken: string;
  }>("/api/auth/admin/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
    headers: {
      "device-id": deviceId,
      "Content-Type": "application/json",
    },
  });
  if (res.status === APIStatus.OK && res.data) {
    const cookieStore = await cookies();
    cookieStore.set("accessToken", res.data.accessToken);
    cookieStore.set("refreshToken", res.data.refreshToken);
    return NextResponse.json({
      status: APIStatus.OK,
      data: res.data,
      message: "Login successfully",
    });
  }
  return NextResponse.json({
    status: APIStatus.UNAUTHORIZED,
    data: null,
    message: "Login failed",
  });
}
