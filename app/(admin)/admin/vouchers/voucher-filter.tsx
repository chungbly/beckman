"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { sanitizeObject } from "@/utils/object";
import { serialize } from "@/utils/search-query";
import { useForm } from "@tanstack/react-form";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const WithLabel = ({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-1", className)}>
    <label className="text-xs font-semibold">{label}</label>
    {children}
  </div>
);

function VoucherFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const isActive = searchParams.get("isActive");
  const isUsed = searchParams.get("isUsed");
  const name = searchParams.get("name");
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const isCoupon = searchParams.get("isCoupon");

  const query = {
    page: Number(page) || 1,
    limit: Number(limit) || 100,
    isActive: isActive === "true" ? true : isActive === "false" ? false : "all",
    isUsed: isUsed === "true" ? true : isUsed === "false" ? false : "all",
    isCoupon: isCoupon === "true" ? true : isCoupon === "false" ? false : "all",
    name,
    code,
    type: type || "all",
  };
  const form = useForm({
    defaultValues: query,
    onSubmit: ({ value }) => {
      const queryObj = sanitizeObject({
        ...value,
      });

      router.push(`/admin/vouchers?${serialize(queryObj)}`);
    },
  });
  return (
    <form
      className="bg-white shadow-sm rounded-sm p-4 grid grid-cols-1 sm:grid-cols-4 gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <WithLabel className="col-span-1" label="Mã đơn">
        <form.Field
          name="code"
          children={(field) => (
            <Input
              type="text"
              value={field.state.value || ""}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border border-gray-300 rounded-sm py-2 px-3"
              placeholder="Search"
            />
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Tên phiếu">
        <form.Field
          name="name"
          children={(field) => (
            <Input
              type="text"
              value={field.state.value || ""}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border border-gray-300 rounded-sm py-2 px-3"
              placeholder="Search"
            />
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Trạng thái kích hoạt">
        <form.Field
          name="isActive"
          children={(field) => (
            <Select
              value={
                field.state.value === "all"
                  ? "all"
                  : field.state.value
                  ? "true"
                  : "false"
              }
              onValueChange={(v) =>
                field.handleChange(
                  v === "all" ? "all" : v === "true" ? true : false
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Kích hoạt</SelectItem>
                <SelectItem value="false">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Trạng thái sử dụng">
        <form.Field
          name="isUsed"
          children={(field) => (
            <Select
              value={
                field.state.value === "all"
                  ? "all"
                  : field.state.value
                  ? "true"
                  : "false"
              }
              onValueChange={(v) =>
                field.handleChange(
                  v === "all" ? "all" : v === "true" ? true : false
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Đã sử dụng</SelectItem>
                <SelectItem value="false">Chưa sử dụng</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </WithLabel>

      <WithLabel className="col-span-1" label="Hình thức giảm giá">
        <form.Field
          name="type"
          children={(field) => (
            <Select
              value={field.state.value === "all" ? "all" : field.state.value}
              onValueChange={(v) => field.handleChange(v === "all" ? "all" : v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="percent">Giảm theo %</SelectItem>
                <SelectItem value="fixed-amount">Giảm giá cố định</SelectItem>
                <SelectItem value="free-shipping">Giảm giá cố định</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </WithLabel>

      <WithLabel className="col-span-1" label="Loại phiếu">
        <form.Field
          name="isCoupon"
          children={(field) => {
            const value = field.state.value;
            return (
              <Select
                value={
                  field.state.value === "all"
                    ? "all"
                    : field.state.value
                    ? "true"
                    : "false"
                }
                onValueChange={(v) =>
                  field.handleChange(
                    v === "all" ? "all" : v === "true" ? true : false
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="true">Coupon</SelectItem>
                  <SelectItem value="false">Voucher</SelectItem>
                </SelectContent>
              </Select>
            );
          }}
        />
      </WithLabel>

      <div className="cols-span-1 sm:col-span-4 gap-4 flex justify-end">
        <Button
          variant="secondary"
          type="reset"
          onClick={() => router.push("/admin/vouchers")}
        >
          Làm mới
        </Button>
        <Button type="submit">
          <Search size={16} className="mr-2" />
          Tìm kiếm
        </Button>
      </div>
    </form>
  );
}

export default VoucherFilter;
