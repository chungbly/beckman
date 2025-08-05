"use client";

import type React from "react";

import { APIStatus } from "@/client/callAPI";
import { createCustomer, getCustomers } from "@/client/customer.client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { setUserId } from "@/lib/cookies";
import { Tier } from "@/types/customer";
import { Voucher } from "@/types/voucher";
import { escapeHtml } from "@/utils";
import { LogIn, Phone, User } from "lucide-react";
import { useState } from "react";

export default function LoginDialog({
  children,
  voucher,
}: {
  children: React.ReactNode;
  voucher?: Voucher | null;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ name: "", phone: "" });
  const { toast } = useToast();

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({ name: "", phone: "" });

    let isValid = true;

    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Name is required" }));
      isValid = false;
    }

    if (!validatePhone(phone)) {
      setErrors((prev) => ({
        ...prev,
        phone: "Please enter a valid 10-digit phone number",
      }));
      isValid = false;
    }
    if (!isValid) return;
    setIsLoading(true);

    const res = await getCustomers(
      {
        phoneNumber: phone,
      },
      1,
      1
    );
    let customer = null;
    if (!res?.data?.length || res.status !== APIStatus.OK || !res?.data) {
      const res = await createCustomer({
        name,
        phoneNumbers: [phone],
        tier: Tier.NEW,
        ...(voucher && {
          voucherCodes: [voucher.code],
        }),
      });
      if (res.status !== APIStatus.OK || !res?.data) {
        setIsLoading(false);
        return toast({
          title: "Error",
          description: "Có lỗi xảy ra, vui lòng thử lại sau",
          variant: "error",
        });
      }
      customer = res.data;
      await setUserId(customer._id);
    } else {
      customer = res.data[0];
      await setUserId(customer._id);
    }
    toast({
      title: "Chào mừng bạn!",
      description: `Đăng nhập thành công với tên ${
        customer?.name || customer?.phoneNumbers?.[0] || name
      }`,
    });

    setOpen(false);
    setName("");
    setPhone("");
    setTimeout(() => {
      window.location.reload();
      setIsLoading(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-lg" />
        <div className="relative">
          <DialogHeader className="text-center space-y-3 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Đăng nhập
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Đăng nhập nhanh chỉ với số điện thoại và tên của bạn
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Họ và tên
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(escapeHtml(e.target.value))}
                className={`h-12 border-2 transition-all duration-200 ${
                  errors.name
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                } rounded-lg bg-white/50 backdrop-blur-sm`}
                placeholder="Nhập họ và tên của bạn"
              />
              {errors.name && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Số điện thoại
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(escapeHtml(e.target.value))}
                className={`h-12 border-2 transition-all duration-200 ${
                  errors.phone
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                } rounded-lg bg-white/50 backdrop-blur-sm`}
                placeholder="Nhập số điện thoại của bạn"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.phone}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 mt-8"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
