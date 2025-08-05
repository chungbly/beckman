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

type UserQuery = {
  fullName?: string;
  email?: string;
  status?: string;
  phoneNumber?: string;
};

function UserFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const form = useForm<UserQuery>({
    defaultValues: {
      fullName: searchParams.get("fullName") || "",
      status: searchParams.get("status") || "ACTIVE",
      email: searchParams.get("email") || "",
      phoneNumber: searchParams.get("phoneNumber") || "",
    },
    onSubmit: ({ value }) => {
      router.push(`/admin/users?${serialize(sanitizeObject(value))}`);
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
      <WithLabel className="col-span-1" label="Tên người dùng">
        <form.Field
          name="fullName"
          children={(field) => (
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border border-gray-300 rounded-sm py-2 px-3"
              placeholder="Nhập tên người dùng"
            />
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Email">
        <form.Field
          name="email"
          children={(field) => (
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border border-gray-300 rounded-sm py-2 px-3"
              placeholder="Nhập email"
            />
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Số điện thoại">
        <form.Field
          name="phoneNumber"
          children={(field) => (
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border border-gray-300 rounded-sm py-2 px-3"
              placeholder="Nhập số điện thoại"
            />
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Trạng thái">
        <form.Field
          name="status"
          children={(field) => (
            <Select
              value={field.state.value}
              onValueChange={(v) => field.handleChange(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Kích hoạt</SelectItem>
                <SelectItem value="INACTIVE">Cấm</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </WithLabel>

      <div className="cols-span-1 sm:col-span-4 gap-4 flex justify-end">
        <Button
          variant="secondary"
          type="reset"
          onClick={() => {
            const { pathname, origin } = window.location;
            window.location.replace(`${origin}${pathname}`);
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

export default UserFilter;
