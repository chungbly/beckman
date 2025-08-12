"use client";

import { AuroraText } from "@/components/ui/aurora-text";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "./login-form";

export default function AuthPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-gray-800">
            <AuroraText>Beckman Admin</AuroraText>
          </CardTitle>
          <CardDescription className=" text-gray-600">
            Đăng nhập để truy cập vào Admin Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
