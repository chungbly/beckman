//@ts-nocheck
"use client";
import { use } from "react";

import { APIStatus } from "@/client/callAPI";
import {
  createCategory,
  getCategory,
  updateCategory,
} from "@/client/category.client";
import AceEmmetEditor from "@/components/ace-editor";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import GrapesStudio from "@/components/grapes/v1";
import SumbitButton from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPicker } from "@/components/ui/color-picker";
import { FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { TooltipWrap } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Category } from "@/types/category";
import { getDirtyData } from "@/utils";
import { IconSquareKey } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Globe, Info, LinkIcon, Tag } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import CategoryFormSkeleton from "./loading";

const ImageSelector = dynamic(() => import("../select-image"));

const JoditEditor = dynamic(() => import("@/components/jodit-editor"), {
  ssr: false,
});

const SeoMetrics = dynamic(
  () => import("@/components/app-layout/seo-metrics"),
  {
    ssr: false,
  }
);

function getValueAtPath(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function unflattenObject(flatObj: Record<string, any>) {
  const result: Record<string, any> = {};
  for (const path in flatObj) {
    const keys = path.split(".");
    keys.reduce((acc, key, i) => {
      if (i === keys.length - 1) {
        acc[key] = flatObj[path];
      } else {
        acc[key] ??= {};
      }
      return acc[key];
    }, result);
  }
  return result;
}

const schema = z.object({
  seo: z.object({
    title: z.string(),
    slug: z.string().min(1, "Alias URL không được để trống"),
  }),
});

export default function CategoryForm(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);

  const { id } = params;

  const { toast } = useToast();
  const router = useRouter();
  const { data: category, isLoading } = useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      if (!id || id === "new") return null;
      const res = await getCategory(id);
      if (res.status !== APIStatus.OK || !res.data) return null;
      return res.data;
    },
  });
  const form = useForm<Category>({
    defaultValues: category,
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value, formApi, meta }) => {
      if (!value._id || id === "new") {
        const res = await createCategory(value);
        if (res.status === APIStatus.OK && res.data) {
          toast({
            title: "Tạo mới thành công",
            variant: "success",
          });
          const data = res.data;
          router.push(`/admin/categories/${data._id}`);
        } else {
          toast({
            title: "Tạo mới thất bại",
            variant: "error",
            description: res.message,
          });
        }
        return;
      }
      const dirtyData = getDirtyData(category, value);
      delete dirtyData?.updatedAt;
      const res = await updateCategory(category?._id, dirtyData);
      if (res.status === APIStatus.OK) {
        toast({
          title: "Cập nhật thành công",
          variant: "success",
        });
        window.location.reload();
      } else {
        toast({
          title: "Cập nhật thất bại",
          variant: "error",
          description: res.message,
        });
      }
    },
  });

  if (isLoading) return <CategoryFormSkeleton />;

  return (
    <>
      <div className="p-2 sm:p-6">
        <PageBreadCrumb
          breadcrumbs={[
            { name: "Danh mục sản phẩm", href: "/admin/categories" },
            { name: category?.name || "New" },
          ]}
        />
        <div className="flex items-center justify-between mb-6">
          <div>
            <form.Field
              name="name"
              children={(field) => (
                <h1 className="text-3xl font-bold tracking-tight">
                  {field.state.value}
                </h1>
              )}
            />
            {id && id !== "new" && (
              <p className="text-muted-foreground">
                Category ID: {category?._id}
              </p>
            )}
          </div>
          <form.Subscribe
            selector={(state) => state.isDirty}
            children={(isDirty) => (
              <SumbitButton
                isDirty={isDirty}
                handleSubmit={form.handleSubmit}
              />
            )}
          />
        </div>
        <form onSubmit={form.handleSubmit} className="grid grid-cols-3 gap-8 ">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex justify-between">
                Thông tin cơ bản
                <form.Field
                  name="isShow"
                  children={(field) => (
                    <Switch
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  )}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form.Field
                name="name"
                children={(field) => (
                  <div>
                    <Label>Tên danh mục</Label>
                    <Input
                      type="text"
                      value={field.state.value || ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Nhập tên danh mục"
                    />
                  </div>
                )}
              />

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="textColor"
                  children={(field) => {
                    return (
                      <div>
                        <Label>Màu chữ</Label>
                        <ColorPicker
                          value={field.state.value}
                          onChange={field.handleChange}
                        />
                      </div>
                    );
                  }}
                />
                <form.Field
                  name="backgroundColor"
                  children={(field) => (
                    <div>
                      <Label>Màu nền</Label>
                      <ColorPicker
                        value={field.state.value}
                        onChange={field.handleChange}
                      />
                    </div>
                  )}
                />
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Hình ảnh</h3>
                <div className="grid grid-cols-2 gap-4">
                  <form.Field
                    name="desktopBanner"
                    children={(field) => (
                      <div className="col-span-1">
                        <Label>Desktop Banner</Label>
                        <ImageSelector
                          value={field.state.value}
                          onChange={(url) => field.handleChange(url)}
                        />
                      </div>
                    )}
                  />
                  <form.Field
                    name="mobileBanner"
                    children={(field) => (
                      <div className="col-span-1">
                        <Label>Mobile Banner</Label>
                        <ImageSelector
                          value={field.state.value}
                          onChange={(url) => field.handleChange(url)}
                        />
                      </div>
                    )}
                  />
                  <div className="space-y-2">
                    <form.Field
                      name="sizeSelectionGuide"
                      children={(field) => (
                        <div>
                          <Label>Bảng chọn size</Label>
                          <ImageSelector
                            value={field.state.value}
                            onChange={(url) => field.handleChange(url)}
                          />
                        </div>
                      )}
                    />
                    <form.Field
                      name="isApplyForAllChildren"
                      children={(field) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <Checkbox
                            checked={field.state.value}
                            onCheckedChange={(value) =>
                              field.handleChange(value)
                            }
                          />
                          <div className=" flex flex-col space-y-1 leading-none">
                            <span>Áp dụng cho danh mục con</span>
                            <span className="text-sm text-neutral-400">
                              Áp dụng bảng size cho toàn bộ danh mục con
                            </span>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <form.Field
                name="description"
                children={(field) => (
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <JoditEditor
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value)}
                    />
                  </div>
                )}
              />

              <div className="space-y-4">
                <div className="flex gap-2 items-center">
                  <Label htmlFor="content">Bộ lọc sản phẩm</Label>
                  <TooltipWrap content="JSON tuỳ chỉnh bộ lọc sản phẩm, nếu không cài đặt hệ thống sẽ lấy cài đặt mặc định">
                    <Info size={12} className="text-blue-500" />
                  </TooltipWrap>
                </div>
                <form.Field
                  name="filterJSON"
                  children={(field) => (
                    <AceEmmetEditor
                      value={field.state.value || ""}
                      onChange={(value) => field.handleChange(value)}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <Label htmlFor="seo-title">SEO Title</Label>
                </div>
                <form.Field name="seo.title">
                  {(field) => {
                    return (
                      <Input
                        id="seo-title"
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    );
                  }}
                </form.Field>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  <Label htmlFor="url-alias">URL Alias</Label>
                </div>
                <form.Field name="seo.slug">
                  {(field) => {
                    return (
                      <>
                        <Input
                          id="url-alias"
                          className={cn(
                            "",
                            !!field.state.meta.errors?.length
                              ? "border-red-500"
                              : ""
                          )}
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <div className="text-sm">
                          Url:
                          <Link
                            className="underline text-blue-400"
                            href={`/danh-muc/${field.state.value}`}
                          >
                            danh-muc/{field.state.value}
                          </Link>
                        </div>
                        {!!field.state.meta.errors?.length && (
                          <div className="text-red-500 text-sm">
                            {field.state.meta?.errors?.[0]}
                          </div>
                        )}
                      </>
                    );
                  }}
                </form.Field>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <IconSquareKey className="h-4 w-4" />
                  <Label htmlFor="meta-keywords">Keyword</Label>
                </div>
                <form.Field name="seo.tags">
                  {(field) => {
                    return (
                      <Input
                        id="seo-tags"
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    );
                  }}
                </form.Field>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <Label htmlFor="meta-description">Meta Description</Label>
                </div>
                <form.Field name="seo.description">
                  {(field) => {
                    return (
                      <AutosizeTextarea
                        id="meta-description"
                        minHeight={200}
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    );
                  }}
                </form.Field>
              </div>

              <form.Subscribe
                selector={(state) => ({
                  seo: state.values?.seo || {},
                  description: state.values?.description || "",
                })}
                children={({ seo, description }) => {
                  return <SeoMetrics seo={seo} description={description} />;
                }}
              />
            </CardContent>
          </Card>
        </form>
      </div>
      <form.Field name="header">
        {(field) => {
          const value = (() => {
            try {
              return category?.header?.project
                ? JSON.parse(category?.header?.project)
                : {};
            } catch (error) {
              return {};
            }
          })();
          return (
            <GrapesStudio
              value={value}
              pages={{
                add: false,
                duplicate: false,
                remove: false,
              }}
              project={{
                type: "web",
                default: {
                  pages: [
                    { name: category?.name, compoment: "<div>New page</div>" },
                  ],
                },
              }}
              onSave={(data) => {
                field.handleChange(data);
                form.handleSubmit();
              }}
            />
          );
        }}
      </form.Field>
    </>
  );
}
