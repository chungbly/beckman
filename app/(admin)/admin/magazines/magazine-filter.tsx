"use client";
import UserSelector from "@/components/selectors/user-selector";
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
import { resetFilter, serialize } from "@/utils/search-query";
import { useForm } from "@tanstack/react-form";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

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
  title: string;
  isShow: boolean;
  isMagazine: boolean;
  authorId: string;
  page?: number;
};

function MagazineFilter({ query }: { query: Filter }) {
  const router = useRouter();
  const form = useForm<Filter>({
    defaultValues: {
      title: query.title || "",
      isMagazine: query.isMagazine,
      isShow: query.isShow,
      authorId: query.authorId || "",
    },
    onSubmit: ({ value }) => {
      const queryObj = sanitizeObject({
        ...value,
      });
      router.push(`/admin/magazines?${serialize(queryObj)}`);
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
      <WithLabel className="col-span-1" label="Tên bài viết">
        <form.Field
          name="title"
          children={(field) => (
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border border-gray-300 rounded-sm py-2 px-3"
              placeholder="Nhập tên bài viết"
            />
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Trạng thái">
        <form.Field
          name="isShow"
          children={(field) => (
            <Select
              value={field.state.value ? "true" : "false"}
              onValueChange={(v) => field.handleChange(v === "true")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Hiển thị</SelectItem>
                <SelectItem value="false">Ẩn</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Loại">
        <form.Field
          name="isMagazine"
          children={(field) => (
            <Select
              value={field.state.value ? "magazine" : "about"}
              onValueChange={(v) => field.handleChange(v === "magazine")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="magazine">Magazine</SelectItem>
                <SelectItem value="about">Giới thiệu</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Nguời tạo">
        <form.Field
          name="authorId"
          children={(field) => (
            <UserSelector
              value={field.state.value}
              onChange={(v) => field.handleChange(v)}
            />
          )}
        />
      </WithLabel>

      <div className="cols-span-1 sm:col-span-4 gap-4 flex justify-end">
        <Button type="reset" variant="secondary" onClick={resetFilter}>
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

export default MagazineFilter;
