"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  rootUrl: string;
  destinationUrl: string;
};

function RedirectsFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const form = useForm<UserQuery>({
    defaultValues: {
      rootUrl: searchParams.get("rootUrl") ?? "",
      destinationUrl: searchParams.get("destinationUrl") ?? "",
    },
    onSubmit: ({ value }) => {
      router.push(`/admin/settings/redirects?${serialize(sanitizeObject(value))}`);
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
      <WithLabel className="col-span-1" label="Url gốc">
        <form.Field
          name="rootUrl"
          children={(field) => (
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border border-gray-300 rounded-sm py-2 px-3"
              placeholder="Nhập Url gốc"
            />
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Url đích">
        <form.Field
          name="destinationUrl"
          children={(field) => (
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border border-gray-300 rounded-sm py-2 px-3"
              placeholder="Nhập Url đích"
            />
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

export default RedirectsFilter;
