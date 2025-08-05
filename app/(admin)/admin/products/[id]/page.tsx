"use client";
import { use } from "react";

import { APIStatus } from "@/client/callAPI";
import { getProduct, updateProduct } from "@/client/product.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import CategorySelector from "@/components/category-selector";
import FileManagerDialog from "@/components/file-manager/file-manager-dialog";
import InputTags from "@/components/pages/admin/ui/input-tags";
import SumbitButton from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Product as TProduct } from "@/types/product";
import { getDirtyData } from "@/utils";
import { formatCurrency, formatNumber } from "@/utils/number";
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
import { notFound } from "next/navigation";
import { v4 } from "uuid";
import { ProductComments } from "./product-comment";
import { ProductGifts } from "./product-gifts";
import ProductDetailSkeleton from "./skeleton";
const JoditEditor = dynamic(() => import("@/components/jodit-editor"), {
  ssr: false,
});

const SeoMetrics = dynamic(
  () => import("@/components/app-layout/seo-metrics"),
  {
    ssr: false,
  }
);

export default function Product(props: {
  params: Promise<{
    id: number;
  }>;
}) {
  const params = use(props.params);
  const { id } = params;
  const { toast } = useToast();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await getProduct(id);
      if (res.status !== APIStatus.OK || !res.data) return null;
      return res.data;
    },
  });

  const form = useForm<TProduct>({
    defaultValues: product!,
    onSubmit: async ({ value }) => {
      const dirtyData = getDirtyData(product!, value);
      const res = await updateProduct(product!.kvId, dirtyData);
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

  if (isLoading) return <ProductDetailSkeleton />;

  if (!isLoading && !product) return notFound();

  return (
    <div className="p-4">
      <PageBreadCrumb
        breadcrumbs={[
          { name: "Danh sách sản phẩm", href: "/admin/products" },
          {
            name: product?.name || product?.kvFullName || "Product",
            href: `/admin/products/${id}`,
          },
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
          <p className="text-muted-foreground">Product ID: {product!.kvId}</p>
        </div>
        <form.Subscribe
          selector={(state) => state.isDirty}
          children={(isDirty) => (
            <SumbitButton isDirty={isDirty} handleSubmit={form.handleSubmit} />
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hiển thị</Label>
                  <p className="text-sm text-muted-foreground">
                    Trạng thái hiển thị sản phẩm
                  </p>
                </div>
                <form.Field
                  name="isShow"
                  children={(field) => (
                    <Switch
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  )}
                />
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-4">
                <div className="gap-2 col-span-1">
                  <Label htmlFor="name">Tên sản phẩm</Label>
                  <form.Field
                    name="name"
                    children={(field) => (
                      <Input
                        id="name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    )}
                  />
                </div>
                <div className="col-span-1 grid grid-cols-1 sm:grid-cols-2  xl:grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="price">Giá gốc</Label>
                    <form.Field
                      name="basePrice"
                      children={(field) => (
                        <>
                          <Input
                            id="price"
                            type="number"
                            value={field.state.value}
                            onChange={(e) =>
                              field.handleChange(+e.target.value)
                            }
                          />
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(field.state.value)}
                          </p>
                        </>
                      )}
                    />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="sale-price">Giá sale</Label>
                    <form.Field
                      name="salePrice"
                      children={(field) => (
                        <>
                          <Input
                            id="sale-price"
                            type="number"
                            value={field.state.value}
                            onChange={(e) =>
                              field.handleChange(+e.target.value)
                            }
                          />
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(field.state.value)}
                          </p>
                        </>
                      )}
                    />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="shippingFee">Phí ship</Label>
                    <form.Field
                      name="shippingFee"
                      children={(field) => (
                        <>
                          <Input
                            id="shippingFee"
                            value={field.state.value}
                            type="number"
                            onChange={(e) =>
                              field.handleChange(+e.target.value)
                            }
                          />
                          {field.state.value ? (
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(field.state.value)}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Chưa cài đặt
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="sold">Đã bán</Label>
                    <form.Field
                      name="sold"
                      children={(field) => (
                        <>
                          <Input
                            id="sold"
                            value={field.state.value}
                            type="number"
                            onChange={(e) =>
                              field.handleChange(+e.target.value)
                            }
                          />
                          <p className="text-sm text-muted-foreground">
                            {field.state.value &&
                              formatNumber(field.state.value || 0)}
                          </p>
                        </>
                      )}
                    />
                  </div>
                </div>
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <form.Field
                    name="categories"
                    children={(field) => (
                      <CategorySelector
                        value={field.state.value ?? []}
                        onChange={(v) =>
                          field.handleChange(v.map((c) => c.value))
                        }
                      />
                    )}
                  />
                </div>
                <form.Field name="tags">
                  {(field) => {
                    const tags = field.state.value?.map((t) => t.trim()) || [];
                    return (
                      <div>
                        <Label className="flex gap-2 items-center mb-1">
                          Tags
                          <Tag size={16} />
                        </Label>
                        <InputTags tags={tags} onChange={field.handleChange} />
                      </div>
                    );
                  }}
                </form.Field>
                <form.Field name="suggestionTags">
                  {(field) => {
                    const tags = field.state.value?.map((t) => t.trim()) || [];
                    return (
                      <div>
                        <Label className="flex gap-2 items-center mb-1">
                          Tags sản phẩm liên quan
                          <Tag size={16} />
                        </Label>
                        <InputTags tags={tags} onChange={field.handleChange} />
                      </div>
                    );
                  }}
                </form.Field>

                <form.Field
                  name="gifts"
                  children={(field) => (
                    <ProductGifts
                      gifts={field.state.value ?? []}
                      onChange={(gifts) => {
                        field.handleChange(gifts);
                      }}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mô tả sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="description" className="flex-1">
                    Mô tả chi tiết
                  </TabsTrigger>
                  <TabsTrigger value="additional" className="flex-1">
                    Thông tin bổ sung
                  </TabsTrigger>
                  <TabsTrigger value="images" className="flex-1">
                    Hình ảnh
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-4">
                  <form.Field
                    name="description"
                    children={(field) => (
                      <JoditEditor
                        value={field.state.value}
                        onChange={field.handleChange}
                      />
                    )}
                  />
                </TabsContent>
                <TabsContent value="additional" className="mt-4 ">
                  <Card>
                    <CardHeader>
                      <CardTitle>5 dòng mô tả chính</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form.Field
                        name="discribles"
                        mode="array"
                        children={(field) => (
                          <div className="flex flex-col gap-2">
                            {Array.from({ length: 5 }).map((_, i) => {
                              return (
                                <form.Field key={i} name={`discribles[${i}]`}>
                                  {(subField) => {
                                    return (
                                      <div key={i} className="space-y-2">
                                        <Label htmlFor={`discrible-${i}`}>
                                          Mô tả {i + 1}
                                        </Label>
                                        <Input
                                          id={`discrible-${i}`}
                                          value={subField.state.value}
                                          onChange={(e) => {
                                            subField.handleChange(
                                              e.target.value
                                            );
                                            form.setFieldMeta("discribles", {
                                              ...field.state.meta,
                                              isDirty: true,
                                            });
                                          }}
                                        />
                                      </div>
                                    );
                                  }}
                                </form.Field>
                              );
                            })}
                          </div>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="images" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Hình ảnh và màu sắc</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form.Field
                        name="images"
                        children={(field) => {
                          const images = field.state.value || [];
                          return images.map(({ color, urls }) => (
                            <div key={color} className="mb-8 last:mb-0">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg text-neutral-600">
                                  {color}
                                </h3>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-4">
                                <FileManagerDialog
                                  onSelect={(values) => {
                                    field.handleChange(
                                      images.map((image) => {
                                        if (image.color === color) {
                                          return {
                                            ...image,
                                            urls: [...image.urls, ...values],
                                          };
                                        }
                                        return image;
                                      })
                                    );
                                  }}
                                >
                                  <div className="flex cursor-pointer items-center justify-center aspect-square bg-gray-200 rounded-lg border border-dashed border-primary">
                                    <ImagePlus className="h-6 w-6" />
                                  </div>
                                </FileManagerDialog>

                                {urls.map((src, imageIndex) => (
                                  <div key={v4()} className="relative group">
                                    <Image
                                      src={src}
                                      alt={`${color} - Image ${imageIndex + 1}`}
                                      width={100}
                                      height={100}
                                      className="rounded-lg border object-cover w-full aspect-square"
                                    />
                                    <button
                                      className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white shadow-sm invisible group-hover:visible transition-all"
                                      onClick={() => {
                                        field.handleChange(
                                          images.map((image) => {
                                            if (image.color === color) {
                                              return {
                                                ...image,
                                                urls: image.urls.filter(
                                                  (_, i) => i !== imageIndex
                                                ),
                                              };
                                            }
                                            return image;
                                          })
                                        );
                                      }}
                                    >
                                      <X className="h-4 w-4 text-gray-600" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ));
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <ProductComments productId={product!.kvId} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
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
                                className="rounded-sm"
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
                          <Label htmlFor="url-alias">Slug</Label>
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
                          value={field.state.value?.description}
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
                  description: state.values?.description || "",
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
