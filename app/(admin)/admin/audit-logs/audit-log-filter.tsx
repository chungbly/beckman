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
import { sanitizeObject } from "@/utils/object";
import { serialize } from "@/utils/search-query";
import { useForm } from "@tanstack/react-form";
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
  <div className={className}>
    <label className="text-sm font-medium">{label}</label>
    {children}
  </div>
);

function AuditLogFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const userId = searchParams.get("userId");
  const action = searchParams.get("action");
  const resource = searchParams.get("resource");
  const resourceId = searchParams.get("resourceId");

  const query = {
    page: Number(page) || 1,
    limit: Number(limit) || 100,
    userId: userId || "",
    action: action || "",
    resource: resource || "",
    resourceId: resourceId || "",
  };

  const form = useForm({
    defaultValues: query,
    onSubmit: ({ value }) => {
      const queryObj = sanitizeObject({
        ...value,
        page: 1, // Reset to page 1 when filtering
      });

      router.push(`/admin/audit-logs?${serialize(queryObj)}`);
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
      <WithLabel className="flex-1" label="User ID">
        <form.Field
          name="userId"
          children={(field) => (
            <Input
              placeholder="User ID"
              value={field.state.value || ""}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full"
            />
          )}
        />
      </WithLabel>
      <WithLabel className="flex-1" label="Action">
        <form.Field
          name="action"
          children={(field) => (
            <Select
              value={field.state.value || "all"}
              onValueChange={(v) => field.handleChange(v === "all" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </WithLabel>
      <WithLabel className="flex-1" label="Resource">
        <form.Field
          name="resource"
          children={(field) => (
            <Input
              placeholder="Resource"
              value={field.state.value || ""}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full"
            />
          )}
        />
      </WithLabel>
      <WithLabel className="flex-1" label="Resource ID">
        <form.Field
          name="resourceId"
          children={(field) => (
            <Input
              placeholder="Resource ID"
              value={field.state.value || ""}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full"
            />
          )}
        />
      </WithLabel>
      <div className="col-span-1 sm:col-span-4 flex justify-end gap-2">
        <Button
          variant="outline"
          type="reset"
          onClick={() => router.push("/admin/audit-logs")}
        >
          Đặt lại
        </Button>
        <Button type="submit">Tìm kiếm</Button>
      </div>
    </form>
  );
}

export default AuditLogFilter;
