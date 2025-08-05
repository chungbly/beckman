"use client";
import { APIStatus } from "@/client/callAPI";
import { updateConfig } from "@/client/configs.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import CategorySelector from "@/components/category-selector";
import ProductSelector, {
  ArrayChipProduct,
} from "@/components/selectors/product-selector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAlert } from "@/store/useAlert";
import { useConfigs } from "@/store/useConfig";
import { useForm } from "@tanstack/react-form";
import { InfoIcon, Plus, Save, Trash2, X } from "lucide-react";
import { v4 } from "uuid";
import ImageSelector from "../../categories/select-image";

type FrameType = "Category" | "Product" | "Prefix";

export interface Frame {
  selectedProducts: number[];
  selectedCategory: {
    value: string;
    label: string;
  }[];
  isApplyForAllCategory: boolean;
  isApplyForAllProduct: boolean;
  prefixes: string[];
  image: string;
  type: FrameType;
}

function Page() {
  const configs = useConfigs((s) => s.configs);
  const { toast } = useToast();
  const { setAlert, closeAlert } = useAlert();
  const frames = (configs?.["FRAMES"] as Frame[]) ?? [];
  const form = useForm<{
    frames: Frame[];
  }>({
    defaultValues: {
      frames,
    },
    onSubmit: async ({ value }) => {
      const res = await updateConfig("FRAMES", JSON.stringify(value.frames));
      if (res.status === APIStatus.OK) {
        toast({
          title: "Cập nhật thành công",
        });
      } else {
        toast({
          title: "Cập nhật không thành công",
          description: res.message,
          variant: "error",
        });
      }
    },
  });

  const handleSubmit = () => {
    setAlert({
      title: "Xác nhận cập nhật",
      description: "Bạn có chắc chắn muốn cập nhật không?",
      onSubmit: () => {
        form.handleSubmit();
        closeAlert();
      },
    });
  };

  return (
    <div className="p-4">
      <PageBreadCrumb
        breadcrumbs={[{ name: "Danh sách khung hình cho sản phẩm" }]}
      />
      <header className="mb-4">
        <Alert variant="destructive" className="bg-muted">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Lưu ý: Nếu có nhiều khung hình cho<b> cùng một sản phẩm </b>, khung
            hình sẽ được ưu tiên theo thứ tự: Danh mục &gt; Sản phẩm &gt; Theo
            prefix
          </AlertDescription>
        </Alert>
      </header>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Danh sách khung hình cho sản phẩm</CardTitle>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Lưu
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form.Field name="frames" mode="array">
            {(frames) => {
              return frames.state.value?.map((_, index) => {
                return (
                  <div
                    key={index}
                    className="flex gap-2 sm:flex-row flex-col border rounded-lg p-4 relative"
                  >
                    <div className="mr-2">
                      <form.Field name={`frames[${index}].image`}>
                        {(field) => (
                          <ImageSelector
                            value={field.state.value}
                            onChange={(v) => field.handleChange(v)}
                            className="w-[200px] h-[200px]"
                          />
                        )}
                      </form.Field>
                    </div>
                    <div className="flex-1  grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 ">
                      <div className="col-span-1">
                        <div className="mb-4">Áp dụng theo</div>
                        <form.Field name={`frames[${index}].type`}>
                          {(field) => (
                            <RadioGroup
                              value={field.state.value}
                              onValueChange={(v) =>
                                field.handleChange(v as FrameType)
                              }
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Category" id="r1" />
                                <Label htmlFor="r1">Danh mục</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Product" id="r2" />
                                <Label htmlFor="r2">Sản phẩm</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Prefix" id="r3" />
                                <Label htmlFor="r3">Prefix mã sản phẩm</Label>
                              </div>
                            </RadioGroup>
                          )}
                        </form.Field>
                      </div>
                      <div className="col-span-1 sm:col-span-2 space-y-4">
                        <form.Field name={`frames[${index}].type`}>
                          {(field) => {
                            const type = field.state.value;
                            return (
                              <>
                                <div
                                  className={cn(
                                    "hidden space-y-4",
                                    type === "Category" && "block"
                                  )}
                                >
                                  <form.Field
                                    name={`frames[${index}].selectedCategory`}
                                    children={(cateField) => (
                                      <form.Field
                                        name={`frames[${index}].isApplyForAllCategory`}
                                      >
                                        {(isApplyForAllCategoryField) => {
                                          const isApplyForAllCategory =
                                            isApplyForAllCategoryField.state
                                              .value;
                                          return (
                                            <>
                                              <CategorySelector
                                                value={
                                                  cateField.state.value?.map(
                                                    (v) => v.value
                                                  ) ?? []
                                                }
                                                onChange={(v) =>
                                                  cateField.handleChange(v)
                                                }
                                              />
                                              <div className="flex items-center space-x-2">
                                                <Checkbox
                                                  checked={
                                                    isApplyForAllCategory
                                                  }
                                                  onCheckedChange={(v) =>
                                                    isApplyForAllCategoryField.handleChange(
                                                      v as boolean
                                                    )
                                                  }
                                                  id="apply-for-all-category"
                                                />
                                                <label
                                                  htmlFor="apply-for-all-category"
                                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                  Áp dụng cho tất cả danh mục
                                                </label>
                                              </div>
                                              <div className="flex flex-wrap gap-2">
                                                {!!cateField.state.value
                                                  ?.length &&
                                                  cateField.state.value.map(
                                                    (cate) => (
                                                      <div
                                                        key={v4()}
                                                        className="bg-gray-200 rounded-full px-2 py-1 text-sm flex items-center gap-2"
                                                      >
                                                        {cate.label}
                                                        <X
                                                          className="h-4 w-4 ml-1 cursor-pointer bg-neutral-300 rounded-full p-1"
                                                          onClick={() =>
                                                            cateField.handleChange(
                                                              cateField.state.value?.filter(
                                                                (c) =>
                                                                  c.value !==
                                                                  cate.value
                                                              ) ?? []
                                                            )
                                                          }
                                                        />
                                                      </div>
                                                    )
                                                  )}
                                              </div>
                                            </>
                                          );
                                        }}
                                      </form.Field>
                                    )}
                                  />
                                </div>
                                <div
                                  className={cn(
                                    "hidden space-y-4",
                                    type === "Product" && "block"
                                  )}
                                >
                                  <form.Field
                                    name={`frames[${index}].selectedProducts`}
                                    children={(prodField) => (
                                      <form.Field
                                        name={`frames[${index}].isApplyForAllProduct`}
                                      >
                                        {(isApplyForAllProductField) => {
                                          const isApplyForAllProduct =
                                            isApplyForAllProductField.state
                                              .value;

                                          return (
                                            <>
                                              <ProductSelector
                                                disabled={isApplyForAllProduct}
                                                multiple
                                                value={
                                                  isApplyForAllProduct
                                                    ? []
                                                    : prodField.state.value ??
                                                      ""
                                                }
                                                onChange={(v) =>
                                                  prodField.handleChange(v)
                                                }
                                              />
                                              <div className="flex items-center space-x-2">
                                                <Checkbox
                                                  checked={isApplyForAllProduct}
                                                  onCheckedChange={(v) =>
                                                    isApplyForAllProductField.handleChange(
                                                      v as boolean
                                                    )
                                                  }
                                                  id="apply-for-all-product"
                                                />
                                                <label
                                                  htmlFor="apply-for-all-product"
                                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                  Áp dụng cho tất cả sản phẩm
                                                </label>
                                              </div>
                                              {isApplyForAllProduct ? null : (
                                                <ArrayChipProduct
                                                  prdIds={
                                                    prodField.state.value ?? []
                                                  }
                                                  onDelete={(id) =>
                                                    prodField.handleChange(
                                                      (
                                                        prodField.state.value ??
                                                        []
                                                      ).filter((p) => p !== id)
                                                    )
                                                  }
                                                />
                                              )}
                                            </>
                                          );
                                        }}
                                      </form.Field>
                                    )}
                                  />
                                </div>
                                <div
                                  className={cn(
                                    "hidden space-y-4",
                                    type === "Prefix" && "block"
                                  )}
                                >
                                  <form.Field
                                    name={`frames[${index}].prefixes`}
                                  >
                                    {(prefixField) => {
                                      return (
                                        <>
                                          <Input
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                e.preventDefault();
                                                prefixField.handleChange([
                                                  ...(prefixField.state.value ??
                                                    []),
                                                  e.currentTarget.value,
                                                ]);
                                                e.currentTarget.value = "";
                                              }
                                            }}
                                            placeholder="Nhập prefix mã sản phẩm"
                                          />
                                          <div className="flex flex-wrap gap-2">
                                            {!!prefixField.state.value
                                              ?.length &&
                                              prefixField.state.value.map(
                                                (v) => (
                                                  <div
                                                    key={v4()}
                                                    className="bg-gray-200 rounded-full px-2 py-1 text-sm flex items-center gap-2"
                                                  >
                                                    {v}
                                                    <X className="h-4 w-4 ml-1 cursor-pointer bg-neutral-300 rounded-full p-1" />
                                                  </div>
                                                )
                                              )}
                                          </div>
                                        </>
                                      );
                                    }}
                                  </form.Field>
                                </div>
                              </>
                            );
                          }}
                        </form.Field>
                      </div>

                      <Button
                        variant="destructive"
                        className="absolute top-4 right-4"
                        onClick={() => frames.removeValue(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              });
            }}
          </form.Field>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              form.pushFieldValue("frames", {
                selectedProducts: [],
                image: "",
                prefixes: [],
                isApplyForAllProduct: false,
                isApplyForAllCategory: false,
                selectedCategory: [],
                type: "Category",
              });
            }}
          >
            <Plus className="h-4 w-4" />
            Thêm khung hình
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Page;
