//@ts-nocheck

"use client";
import { APIStatus } from "@/client/callAPI";
import { updatePost } from "@/client/post.client";
import FileManagerDialog from "@/components/file-manager/file-manager-dialog";
import { restoreShortcodesFromPreview } from "@/components/jodit-editor";
import SumbitButton from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getPostByIdQuery } from "@/query/post.query";
import { useConfigs } from "@/store/useConfig";
import { getDirtyData } from "@/utils";
import { IconSquareKey } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import {
  Globe,
  ImagePlus,
  Image as ImageUpscale,
  LinkIcon,
  Tag,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { v4 } from "uuid";

const SeoMetrics = dynamic(
  () => import("@/components/app-layout/seo-metrics"),
  {
    ssr: false,
  }
);
const JoditEditor = dynamic(() => import("@/components/jodit-editor"), {
  ssr: false,
});

export default function MagazineEditor() {
  const params = useParams();
  const { toast } = useToast();
  const configs = useConfigs((s) => s.configs);
  const MAGAZINE_CATEGORIES =
    (configs?.["MAGAZINE_CATEGORIES"] as string[]) || [];
  const id = params.id as string;
  const { data } = useQuery(getPostByIdQuery(id));
  const [copied, setCopied] = useState(false);

  const form = useForm({
    defaultValues: data!,
    onSubmit: async ({ value }) => {
      const dirtyData = getDirtyData(data!, value);

      if (dirtyData.content) {
        dirtyData.content = restoreShortcodesFromPreview(dirtyData.content);
      }
      const res = await updatePost(id, dirtyData);
      if (res.status === APIStatus.OK) {
        toast({
          title: "Cập nhật thành công",
          variant: "success",
        });
      } else {
        toast({
          title: "Cập nhật thất bại",
          variant: "error",
          description: res.message,
        });
      }
    },
  });

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className=" p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="col-span-full flex items-center justify-between mb-6">
          <div>
            <form.Field
              name="title"
              children={(field) => (
                <h1 className="text-2xl font-bold tracking-tight">
                  {field.state.value}
                </h1>
              )}
            />
            <p className="text-muted-foreground">Magazine ID: {id}</p>
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
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    1. Thông tin cơ bản
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Hiển thị</Label>
                        <p className="text-sm text-muted-foreground">
                          Trạng thái hiển thị bài viết
                        </p>
                      </div>
                      <form.Field
                        name="isShow"
                        children={(field) => (
                          <Switch
                            checked={field.state.value ?? true}
                            onCheckedChange={field.handleChange}
                          />
                        )}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Cách hiển thị</Label>
                        <p className="text-sm text-muted-foreground">
                          Hiển thị ở dạng carousel (slide)
                        </p>
                      </div>
                      <form.Field
                        name="isSlide"
                        children={(field) => (
                          <Switch
                            checked={field.state.value ?? true}
                            onCheckedChange={field.handleChange}
                          />
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Bài viết nổi bật</Label>
                        <p className="text-sm text-muted-foreground">
                          Đánh dấu là bài viết nổi bật, hiển thị ở mục bài viết
                          nổi bật
                        </p>
                      </div>
                      <form.Field
                        name="isOutStanding"
                        children={(field) => (
                          <Switch
                            checked={field.state.value ?? true}
                            onCheckedChange={field.handleChange}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Tiêu đề bài viết</Label>
                      <form.Field
                        name="title"
                        children={(field) => (
                          <Input
                            id="title"
                            value={field.state.value ?? ""}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="mt-1.5"
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Label htmlFor="subDescription">Mô tả ngắn</Label>
                      <form.Field
                        name="subDescription"
                        children={(field) => (
                          <>
                            <Textarea
                              id="subDescription"
                              value={field.state.value || ""}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className="mt-1.5 min-h-[100px]"
                            />
                            <div className="text-sm text-muted-foreground mt-1">
                              {field.state.value?.length ?? 0} ký tự
                            </div>
                          </>
                        )}
                      />
                    </div>
                    <div>
                      <Label>Tags</Label>
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        <form.Field name="tags">
                          {(field) => {
                            return (
                              <>
                                {field.state.value?.map((tag, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="px-3 py-1"
                                  >
                                    {tag}
                                    <X
                                      onClick={() => {
                                        field.handleChange(
                                          (field.state.value ?? []).filter(
                                            (t) => t !== tag
                                          )
                                        );
                                      }}
                                      className="ml-2 cursor-pointer text-muted-foreground"
                                    />
                                  </Badge>
                                ))}
                                <Select
                                  onValueChange={(v) =>
                                    field.handleChange([
                                      ...(field.state.value ?? []),
                                      v,
                                    ])
                                  }
                                >
                                  <SelectTrigger className="w-[180px]">
                                    + Thêm Tags
                                  </SelectTrigger>
                                  <SelectContent>
                                    {MAGAZINE_CATEGORIES.map(
                                      (category, index) => (
                                        <SelectItem
                                          key={index}
                                          value={category}
                                          disabled={(
                                            field.state.value ?? []
                                          ).includes(category)}
                                        >
                                          <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4" />
                                            {category}
                                          </div>
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </>
                            );
                          }}
                        </form.Field>
                      </div>
                    </div>
                    <form.Field name="images">
                      {(field) => {
                        const images = field.state.value;
                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-4">
                            <FileManagerDialog
                              onSelect={(values) => {
                                field.handleChange([...images, ...values]);
                              }}
                            >
                              <div className="flex cursor-pointer items-center justify-center aspect-square bg-gray-200 rounded-lg border border-dashed border-primary">
                                <ImagePlus className="h-6 w-6" />
                              </div>
                            </FileManagerDialog>

                            {images.map((src, index) => (
                              <div key={v4()} className="relative group">
                                <Image
                                  src={src}
                                  alt={`Image ${index + 1}`}
                                  width={100}
                                  height={100}
                                  className="rounded-lg border object-cover w-full aspect-square"
                                />
                                <button
                                  className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white shadow-sm invisible group-hover:visible transition-all"
                                  onClick={() => {
                                    field.handleChange(
                                      images.filter((i) => i !== src)
                                    );
                                  }}
                                >
                                  <X className="h-4 w-4 text-gray-600" />
                                </button>
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    </form.Field>
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Nội dung</Label>
                  <form.Field
                    name="content"
                    children={(field) => (
                      <JoditEditor
                        value={field.state.value ?? ""}
                        onChange={(value) => field.handleChange(value)}
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SEO Settings */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>2. SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form.Field
                name="seo"
                children={(field) => {
                  return (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ImageUpscale className="h-4 w-4" />
                          <Label htmlFor="seo-title">OG Image</Label>
                        </div>

                        <div className="relative h-[80px] w-[80px] group">
                          {field.state.value?.thumbnail ? (
                            <>
                              <Image
                                src={field.state.value.thumbnail}
                                alt="OG Image"
                                fill
                                className="rounded-sm object-contain border border-gray-200"
                              />
                              <X
                                onClick={() => {
                                  field.handleChange({
                                    ...field.state.value,
                                    thumbnail: "",
                                  });
                                }}
                                className="absolute h-4 w-4 top-1 cursor-pointer right-1 p-1 hidden group-hover:block rounded-full bg-white/80 hover:bg-white shadow-sm"
                              />
                            </>
                          ) : (
                            <FileManagerDialog
                              singleSelect
                              onSelect={(image) => {
                                if (image) {
                                  field.handleChange({
                                    ...field.state.value,
                                    thumbnail: image,
                                  });
                                }
                              }}
                            >
                              <div className="absolute cursor-pointer rounded-sm border-dashed border-primary border inset-0 flex items-center justify-center bg-gray-200">
                                <ImagePlus className="w-6 h-6" />
                              </div>
                            </FileManagerDialog>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <Label htmlFor="seo-title">SEO Title</Label>
                        </div>
                        <Input
                          id="seo-title"
                          value={field.state.value?.title}
                          onChange={(e) =>
                            field.handleChange({
                              ...field.state.value,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4" />
                          <Label htmlFor="url-alias">URL Alias</Label>
                        </div>
                        <Input
                          id="url-alias"
                          value={field.state.value?.slug}
                          onChange={(e) =>
                            field.handleChange({
                              ...field.state.value,
                              slug: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <IconSquareKey className="h-4 w-4" />
                          <Label htmlFor="meta-keywords">Keyword</Label>
                        </div>
                        <Input
                          id="meta-keywords"
                          value={field.state.value?.keywords}
                          onChange={(e) =>
                            field.handleChange({
                              ...field.state.value,
                              keywords: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          <Label htmlFor="meta-description">
                            Meta Description
                          </Label>
                        </div>
                        <Textarea
                          id="meta-description"
                          className="min-h-[150px]"
                          value={field.state.value?.description || ""}
                          onChange={(e) =>
                            field.handleChange({
                              ...field.state.value,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                    </>
                  );
                }}
              />

              <Separator />

              <form.Subscribe
                selector={(state) => ({
                  seo: state.values?.seo || {},
                  description: state.values?.content || "",
                })}
                children={({ seo, description }) => {
                  return <SeoMetrics seo={seo} description={description} />;
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
