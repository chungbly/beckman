"use client";

import { APIResponse, APIStatus } from "@/client/callAPI";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { escapeHtml } from "@/utils";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Loader, Lock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { v4 } from "uuid";

export default function LoginForm() {
  const [message, setMessage] = useState("");
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { pending } = useFormStatus();
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      isRemember: false,
    },
    onSubmit: async ({ value }) => {
      setMessage("");
      setIsLoading(true);
      const email = value.email as string;
      const password = value.password as string;
      localStorage.setItem("email", email);
      localStorage.setItem("password", password);
      const deviceId = localStorage.getItem("device-id") || v4();
      localStorage.setItem("device-id", deviceId);
      const json = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "device-id": deviceId,
        },
        body: JSON.stringify({ email, password }),
      });
      const res: APIResponse<{
        accessToken: string;
        refreshToken: string;
      }> = await json.json();
      if (res.status === APIStatus.OK && res.data?.accessToken) {
        window.location.replace("/admin/products");
      } else {
        setIsLoading(false);

        toast({
          title: "Đăng nhập thất bại",
          description: res.message,
          variant: "error",
        });
        setMessage(res.message);
      }
    },
  });

  useEffect(() => {
    const email = localStorage.getItem("email") || "";
    const password = localStorage.getItem("password") || "";
    const remember = localStorage.getItem("isRemember") === "true";
    form.setFieldValue("email", email);
    form.setFieldValue("password", password);
    form.setFieldValue("isRemember", remember);
  }, []);

  return (
    <form action={form.handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </Label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <form.Field
            name="email"
            children={(field) => {
              return (
                <Input
                  id="email"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(escapeHtml(e.target.value))}
                  name="email"
                  type="email"
                  required
                  className="pl-10"
                  placeholder="Enter your email"
                />
              );
            }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Mật khẩu
        </Label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <form.Field
            name="password"
            children={(field) => {
              return (
                <Input
                  id="password"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  name="password"
                  type={isShowPassword ? "text" : "password"}
                  required
                  className="pl-10"
                  placeholder="Enter your password"
                />
              );
            }}
          />
          {!isShowPassword ? (
            <EyeOff
              className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
              onClick={() => setIsShowPassword(true)}
            />
          ) : (
            <Eye
              className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
              onClick={() => setIsShowPassword(false)}
            />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <form.Field
            name="isRemember"
            children={(field) => {
              return (
                <input
                  type="checkbox"
                  checked={field.state.value}
                  className="form-checkbox border h-4 w-4 text-blue-600 rounded-sm"
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    field.handleChange(isChecked);
                    if (isChecked) {
                      localStorage.setItem("email", form.state.values.email);
                      localStorage.setItem(
                        "password",
                        form.state.values.password || ""
                      );
                      localStorage.setItem("isRemember", "true");
                    } else {
                      localStorage.removeItem("email");
                      localStorage.removeItem("password");
                      localStorage.removeItem("isRemember");
                    }
                  }}
                />
              );
            }}
          />

          <span className="ml-2 text-sm text-gray-600">Remember me</span>
        </label>
      </div>
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-[1.01]"
        disabled={pending || isLoading}
      >
        {pending || isLoading ? (
          <>
            <Loader className="w-5 h-5 text-white animate-spin" />
            <span className="ml-2"> Đang đăng nhập...</span>
          </>
        ) : (
          "Login"
        )}
      </Button>
      {message && (
        <Alert variant="default" className="mt-4 bg-red-100">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
