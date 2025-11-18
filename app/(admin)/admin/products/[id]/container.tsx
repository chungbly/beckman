"use client";

import { APIStatus } from "@/client/callAPI";
import { updateProduct } from "@/client/product.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import CategorySelector from "@/components/category-selector";
import FileManagerDialog from "@/components/file-manager/file-manager-dialog";
import InputTags from "@/components/pages/admin/ui/input-tags";
import ProductSelector, {
  ArrayChipProduct,
} from "@/components/selectors/product-selector";
import SumbitButton from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAlert } from "@/store/useAlert";
import { Product, Product as TProduct } from "@/types/product";
import { getDirtyData } from "@/utils";
import { formatCurrency } from "@/utils/number";
import { IconSquareKey } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import {
  AlertCircle,
  FileText,
  Globe,
  ImagePlus,
  Image as ImageUpscale,
  LinkIcon,
  Tag,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import EditableText from "./editable-text";
import { ProductComments } from "./product-comment";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
const JoditEditor = dynamic(() => import("@/components/jodit-editor"), {
  ssr: false,
});

const SeoMetrics = dynamic(
  () => import("@/components/app-layout/seo-metrics"),
  {
    ssr: false,
  }
);
export interface TProductPopulated
  extends Omit<
    TProduct,
    "similarProducts" | "recommendedProducts" | "categories"
  > {
  similarProducts: number[];
  recommendedProducts: number[];
  categories: string[];
}

const defaultTitle: Record<number, string> = {
  0: "Chất liệu",
  1: "Phương pháp",
  2: "Lót",
  3: "Đế",
  4: "Kiểu dáng",
};
export default function ProductEditPage({ product }: { product: Product }) {
  const params = useParams();
  const id = params.id;
  const { toast } = useToast();
  const { setAlert, closeAlert } = useAlert();

  const form = useForm({
    defaultValues: product
      ? {
          ...product,
          similarProducts: product.similarProducts?.map((c) => c.kvId) || [],
          recommendedProducts:
            product.recommendedProducts?.map((c) => c.kvId) || [],
          discribles:
            product.discribles?.map((c, index) => ({
              content: c.content || "",
              title: c.title || defaultTitle[index],
            })) || [],
          categories: product.categories?.map((c) => c._id) || [],
        }
      : ({} as TProductPopulated),

    onSubmit: async ({ value }) => {
      const dirtyData = getDirtyData(
        {
          ...product,
          similarProducts: product?.similarProducts?.map((c) => c.kvId) || [],
          recommendedProducts:
            product?.recommendedProducts?.map((c) => c.kvId) || [],
          categories: product?.categories?.map((c) => c._id) || [],
        },
        value
      );
      delete dirtyData.updatedAt;
      delete dirtyData.createdAt;

      const res = await updateProduct(product!.kvId, dirtyData);
      if (res.status === APIStatus.OK) {
        toast({
          title: "Cập nhật thành công",
          variant: "success",
        });
        localStorage.removeItem(id!.toString());
      } else {
        toast({
          title: "Cập nhật thất bại",
          variant: "error",
          description: res.message,
        });
      }
    },
    listeners: {
      onChange: ({ formApi, fieldApi }) => {
        // fieldApi represents the field that triggered the event.
        let current = {};
        try {
          current =
            JSON.parse(localStorage.getItem(id!.toString()) || "{}") || {};
          localStorage.setItem(
            id!.toString(),
            JSON.stringify({
              ...current,
              [fieldApi.name]: fieldApi.state.value,
            })
          );
        } catch (e) {
          console.warn("localStorage not accessible:", e);
        }
      },
    },
  });

  useEffect(() => {
    try {
      const draft =
        JSON.parse(localStorage.getItem(id!.toString()) || "{}") || {};
      if (!draft || !Object.keys(draft).length) return;
      setAlert({
        header: (
          <>
            <DialogHeader className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <DialogTitle className="text-xl text-center font-semibold">
                Bạn đang có bản nháp
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Chúng tôi phát hiện bạn có một bản nháp chưa hoàn thành. Bạn có
                muốn tiếp tục chỉnh sửa hay bỏ qua bản nháp này?
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Nếu bạn chọn bỏ qua, tất cả thay đổi chưa lưu sẽ bị mất.
              </p>
            </div>
          </>
        ),
        onSubmit: () => {
          Object.keys(draft).forEach((key) => {
            form.setFieldValue(key as any, draft[key]);
          });
          closeAlert();
        },
        onClose: () => {
          localStorage.removeItem(id!.toString());
          closeAlert();
        },
      });
    } catch (e) {
      console.warn("localStorage not accessible:", e);
    }
  }, []);
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
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="gap-2 col-span-1">
                    <Label htmlFor="subName">Tên sản phẩm dòng phụ</Label>
                    <form.Field
                      name="subName"
                      children={(field) => (
                        <Input
                          id="name"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      )}
                    />
                  </div>
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
                            {field.state.value
                              ? formatCurrency(field.state.value)
                              : "Chưa cài đặt"}
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
                <div className="col-span-1 space-y-2">
                  <Label>Mô tả phụ</Label>
                  <form.Field
                    name="subDescription"
                    children={(field) => (
                      <Textarea
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    )}
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="similarProducts">Sản phẩm tương tự</Label>
                  <form.Field
                    name="similarProducts"
                    children={(field) => (
                      <>
                        <ProductSelector
                          value={field.state.value || []}
                          multiple
                          onChange={(v) => field.handleChange(v)}
                        />
                        <ArrayChipProduct
                          prdIds={field.state.value}
                          onDelete={(id) =>
                            field.handleChange(
                              field.state.value.filter((p) => p !== id)
                            )
                          }
                        />
                      </>
                    )}
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="recommendedProducts">Sản phẩm mua kèm</Label>
                  <form.Field
                    name="recommendedProducts"
                    children={(field) => (
                      <>
                        <ProductSelector
                          value={field.state.value || []}
                          multiple
                          onChange={(v) => {
                            field.handleChange(v);
                          }}
                        />
                        <ArrayChipProduct
                          prdIds={field.state.value}
                          onDelete={(id) =>
                            field.handleChange(
                              field.state.value.filter((p) => p !== id)
                            )
                          }
                        />
                      </>
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mô tả sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="description" className="w-full ">
                <TabsList className="w-full overflow-x-auto scrollbar-hide justify-start">
                  <TabsTrigger value="description" className="flex-1">
                    Mô tả chi tiết
                  </TabsTrigger>
                  <TabsTrigger value="additional" className="flex-1">
                    Chi tiết sản phẩm
                  </TabsTrigger>
                  <TabsTrigger value="warrantyPolicy" className="flex-1">
                    Chính sách bảo hành
                  </TabsTrigger>
                  <TabsTrigger value="careInstructions" className="flex-1">
                    Hướng dẫn bảo quản
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
                        children={(field) => {
                          return (
                            <div className="grid grid-cols-5 gap-4">
                              <div className="col-span-2 sm:col-span-1 flex flex-col gap-2">
                                {Array.from({ length: 5 }).map((_, i) => {
                                  return (
                                    <form.Field
                                      key={i}
                                      name={`discribles[${i}].title`}
                                    >
                                      {(subField) => {
                                        return (
                                          <Input
                                            value={
                                              subField.state.value ||
                                              defaultTitle[i]
                                            }
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
                                        );
                                      }}
                                    </form.Field>
                                  );
                                })}
                              </div>
                              <div className="col-span-3  sm:col-span-4 flex flex-col gap-2">
                                {Array.from({ length: 5 }).map((_, i) => {
                                  return (
                                    <form.Field
                                      key={i}
                                      name={`discribles[${i}].content`}
                                    >
                                      {(subField) => {
                                        return (
                                          <div key={i} className="space-y-2">
                                            <Input
                                              value={subField.state.value || ""}
                                              onChange={(e) => {
                                                subField.handleChange(
                                                  e.target.value
                                                );
                                                form.setFieldMeta(
                                                  "discribles",
                                                  {
                                                    ...field.state.meta,
                                                    isDirty: true,
                                                  }
                                                );
                                              }}
                                            />
                                          </div>
                                        );
                                      }}
                                    </form.Field>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="warrantyPolicy" className="mt-4">
                  <form.Field
                    name="warrantyPolicy"
                    children={(field) => (
                      <JoditEditor
                        value={field.state.value}
                        onChange={field.handleChange}
                      />
                    )}
                  />
                </TabsContent>
                <TabsContent value="careInstructions" className="mt-4">
                  <form.Field
                    name="careInstructions"
                    children={(field) => (
                      <JoditEditor
                        value={field.state.value}
                        onChange={field.handleChange}
                      />
                    )}
                  />
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
                          return images.map(
                            ({ color, urls, thumbnail, altName }) => (
                              <div key={color} className="mb-8 last:mb-0">
                                <div className="flex items-center justify-between mb-4">
                                  <EditableText
                                    value={altName || color}
                                    onChange={(v) => {
                                      field.handleChange(
                                        images.map((image) => {
                                          if (image.color === color) {
                                            return {
                                              ...image,
                                              altName: v,
                                            };
                                          }
                                          return image;
                                        })
                                      );
                                    }}
                                  />

                                  {thumbnail ? (
                                    <Image
                                      src={thumbnail}
                                      alt={color}
                                      width={30}
                                      height={30}
                                      className="rounded-full"
                                    />
                                  ) : (
                                    <FileManagerDialog
                                      onSelect={(values) => {
                                        field.handleChange(
                                          images.map((image) => {
                                            if (image.color === color) {
                                              return {
                                                ...image,
                                                thumbnail: values[0],
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
                                  )}
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
                                    <div
                                      key={src + imageIndex}
                                      className="relative group"
                                    >
                                      <Image
                                        src={src}
                                        alt={`${color} - Image ${
                                          imageIndex + 1
                                        }`}
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
                            )
                          );
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
                        <Link
                          className="underline text-sky-500"
                          target="_blank"
                          href={`https://beckman.vn.vn/${
                            field.state.value?.slug || ""
                          }`}
                        >
                          {`https://beckman.vn.vn/${
                            field.state.value?.slug || ""
                          }`}
                        </Link>
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
