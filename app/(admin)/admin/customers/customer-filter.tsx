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
import { Tier } from "@/types/customer";
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

function CustomerFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const name = searchParams.get("name");
  const code = searchParams.get("code");
  const tier = searchParams.get("tier");
  const phone = searchParams.get("phone");

  const query = {
    page: Number(page) || 1,
    limit: Number(limit) || 100,
    name,
    code,
    phone,
    tier: tier || "all",
    voucherCodes: searchParams.get("voucherCodes")?.split(","),
  };
  const form = useForm({
    defaultValues: query,
    onSubmit: ({ value }) => {
      const queryObj = sanitizeObject({
        ...value,
      });

      router.push(`/admin/customers?${serialize(queryObj)}`);
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
              placeholder="Mã khách hàng"
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
              placeholder="Tên khách hàng"
            />
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Số điện thoại">
        <form.Field
          name="phone"
          children={(field) => (
            <Input
              type="text"
              value={field.state.value || ""}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border border-gray-300 rounded-sm py-2 px-3"
              placeholder="Số điện thoại"
            />
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Mã voucher">
        <form.Field
          name="voucherCodes"
          children={(field) => (
            <Input
              type="text"
              value={field.state.value?.join()}
              onChange={(e) => field.handleChange(e.target.value?.split(","))}
              className="border border-gray-300 rounded-sm py-2 px-3"
              placeholder="Tìm theo voucher"
            />
          )}
        />
      </WithLabel>

      <WithLabel className="col-span-1" label="Hạng thành viên">
        <form.Field
          name="tier"
          children={(field) => {
            const value = field.state.value;
            return (
              <Select
                value={value === "" ? "all" : value}
                onValueChange={(v) => field.handleChange(v === "all" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value={Tier.NEW}>Member mới</SelectItem>
                  <SelectItem value={Tier.MEMBER}>
                    Member thông thường
                  </SelectItem>
                  <SelectItem value={Tier.VIP}>Vip member</SelectItem>
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
          onClick={() => {
            form.reset();
            router.push("/admin/customers");
          }}
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

export default CustomerFilter;
