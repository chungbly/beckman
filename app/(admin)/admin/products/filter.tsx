"use client";
import CategorySelector from "@/components/category-selector";
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

type Filter = {
  name: string;
  code: string;
  status: string;
  categoryIds: string[];
};

function ProductTableFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<Filter>({
    defaultValues: {
      name: searchParams.get("name") ?? "",
      code: searchParams.get("code") ?? "",
      status: searchParams.get("status") ?? "true",
      categoryIds: searchParams.get("categoryIds")?.split(",") ?? [],
    },
    onSubmit: ({ value }) => {
      const queryObj = sanitizeObject({
        ...value,
      });

      router.push(`/admin/products?${serialize(queryObj)}`);
    },
  });

  return (
    <form
      className="bg-white shadow-sm rounded-sm p-4 grid grid-cols-1 sm:grid-cols-4 gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <WithLabel className="col-span-1" label="Tên sản phẩm">
        <form.Field
          name="name"
          children={(field) => (
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border border-gray-300 rounded-sm p-1"
              placeholder="Nhập tên sản phẩm"
            />
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Mã sản phẩm">
        <form.Field
          name="code"
          children={(field) => (
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
              className="border border-gray-300 rounded-sm p-1"
              placeholder="Nhập mã sản phẩm"
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
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Hiển thị</SelectItem>
                <SelectItem value="false">Ẩn</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Danh mục">
        <form.Field
          name="categoryIds"
          children={(field) => {
            return (
              <CategorySelector
                value={field.state.value}
                onChange={(v) => field.handleChange(v.map((c) => c.value))}
              />
            );
          }}
        />
      </WithLabel>
      <div className="cols-span-1 sm:col-span-4 gap-4 flex justify-end">
        <Button
          type="reset"
          variant="secondary"
          onClick={() => {
            form.reset();
            router.push("/admin/products");
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

export default ProductTableFilter;
