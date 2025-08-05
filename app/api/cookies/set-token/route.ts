import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { accessToken } = await request.json();

  const response = NextResponse.json({
    message: "Cookie set",
  });

  response.cookies.set("accessToken", accessToken, {
    path: "/", 
    maxAge: 60 * 60 * 24 * 365 *5, 
    sameSite: "lax", 
    httpOnly: false, 
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
