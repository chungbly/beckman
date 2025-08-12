"use client";

import { useForm } from "@tanstack/react-form";

import { APIStatus } from "@/client/callAPI";
import { createVoucher, updateVoucher } from "@/client/voucher.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import CategorySelector from "@/components/category-selector";
import ProductSelector, {
  ArrayChipProduct,
} from "@/components/selectors/product-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Voucher, VoucherType } from "@/types/voucher";
import { getDirtyData } from "@/utils";
import { formatCurrency } from "@/utils/number";
import { CirclePlus, Trash } from "lucide-react";
import moment from "moment-timezone";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import ProvinceSelector from "./province-selector";

const voucherSchame = z.object({
  isActive: z.boolean(),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  discount: z.object({
    type: z.enum(["percent", "fixed-amount", "free-shipping"]),
    value: z.number().min(0),
    maxDiscount: z.number().min(0),
  }),
  condition: z.object({
    categoryIds: z.optional(z.array(z.string())),
    productIds: z.optional(z.array(z.number())),
    operator: z.enum(["or", "and"]),
    minTotal: z.optional(z.number().min(0)),
  }),
  applyOn: z.object({
    categoryIds: z.optional(z.array(z.string())),
    productIds: z.optional(z.array(z.number())),
  }),
  validFrom: z.string().min(1, "Chọn ngày bắt đầu"),
  validTo: z.string().min(1, "Chọn ngày kết thúc"),
  quantity: z.number(),
});
export default function VoucherForm({
  id,
  voucher,
}: {
  id: string;
  voucher?: Voucher | null;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<Partial<Voucher>>({
    defaultValues: voucher || {
      isActive: true,
      isCoupon: true,
      code: "",
      name: "",
      description: "",
      discount: {
        type: "percent",
        value: 0,
        maxDiscount: 0,
      },
      condition: {
        operator: "or",
      },
      applyOn: {},
      validFrom: "",
      validTo: "",
      quantity: 0,
      used: 0,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      if (!id || id !== "new") {
        const dirtyData = getDirtyData(voucher!, value);
        const res = await updateVoucher(id, dirtyData);
        if (res.status !== APIStatus.OK) {
          toast({
            title: "Cập nhật thất bại",
            description: res.message,
            variant: "error",
          });
        } else {
          toast({
            title: "Cập nhật thành công",
            description: "Voucher đã được cập nhật thành công",
            variant: "success",
          });
        }
        setIsSubmitting(false);
        return;
      }
      const { used, ...payload } = value;
      const res = await createVoucher(payload as Voucher);
      if (res.status !== APIStatus.OK) {
        toast({
          title: "Tạo voucher thất bại",
          description: res.message,
          variant: "error",
        });
        setIsSubmitting(false);

        return;
      } else {
        toast({
          title: "Tạo voucher thành công",
          description: "Voucher đã được tạo thành công",
          variant: "success",
        });
        setIsSubmitting(false);
        const newId = res.data?._id;
        if (!id || id === "new") {
          router.push(`/admin/vouchers/${newId}`);
        }
      }
    },
    validators: {
      onSubmit: voucherSchame,
    },
    onSubmitInvalid: (errors) => {
      // Scroll đến field đầu tiên có lỗi
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const el = document.querySelector(`[name="${firstErrorKey}"]`);
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          (el as HTMLElement).focus();
        }
      }
    },
  });
  return (
    <div className=" sm:p-6">
      <PageBreadCrumb
        breadcrumbs={[
          { name: "Danh sách voucher", href: "/admin/vouchers" },
          { name: "Chi tiết voucher" },
        ]}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <CardTitle className="text-2xl font-bold">
            {id === "new" ? "Tạo Voucher mới" : "Chỉnh sửa Voucher"}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" type="button">
              Hủy
            </Button>
            <Button onClick={form.handleSubmit}>
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Trạng thái</Label>
                <p className="text-sm text-muted-foreground">
                  Trạng thái kích hoạt của phiếu
                </p>
              </div>
              <form.Field
                name="isActive"
                children={(field) => (
                  <Switch
                    checked={field.state.value ?? true}
                    onCheckedChange={field.handleChange}
                  />
                )}
              />
            </div>
            <div>
              <Label>Loại phiếu</Label>
              <form.Field
                name="isCoupon"
                children={(field) => (
                  <>
                    <RadioGroup
                      value={field.state.value ? "coupon" : "voucher"}
                      onValueChange={(v) => {
                        field.handleChange(v === "coupon");
                      }}
                      className="flex gap-2 items-center mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="coupon" id="coupon" />
                        <Label htmlFor="coupon">Coupon</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="voucher" id="voucher" />
                        <Label htmlFor="voucher">Voucher</Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground mt-2">
                      {" "}
                      {field.state.value
                        ? "Coupon dùng cho tất cả đối tượng khách hàng"
                        : "Voucher chỉ áp dụng cho khách hàng đã là thành viên của Beckman"}
                    </p>
                  </>
                )}
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              <form.Field
                name="name"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Tên</Label>
                    <Input
                      id={field.name}
                      placeholder="Giảm thêm 20%"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-xs text-red-500">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                  </div>
                )}
              />
              <form.Field
                name="code"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Code</Label>
                    <Input
                      id={field.name}
                      placeholder="GIAMTHEM20"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-xs text-red-500">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                  </div>
                )}
              />
              <form.Field
                name="discount.type"
                children={(field) => (
                  <div className="space-y-2">
                    <Label>Hình thức giảm giá</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value as VoucherType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Giảm thêm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Giảm giá theo %</SelectItem>
                        <SelectItem value="fixed-amount">
                          Giảm giá cố định
                        </SelectItem>
                        <SelectItem value="free-shipping">
                          Giảm giá vận chuyển
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-xs text-red-500">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                  </div>
                )}
              />
              <form.Field
                name="discount.value"
                children={(field) => (
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor={field.name}>Giá trị giảm</Label>
                    <Input
                      id={field.name}
                      type="number"
                      placeholder="20"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(+e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <form.Field name="discount.type">
                      {({ state }) => (
                        <p className="ml-2 text-muted-foreground text-xs">
                          {state.value === "percent"
                            ? `${field.state.value} %`
                            : formatCurrency(field.state.value)}
                        </p>
                      )}
                    </form.Field>
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-xs text-red-500">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                  </div>
                )}
              />
              <form.Subscribe
                selector={(state) => ({
                  startTime: state.values.validFrom || "",
                  endTime: state.values.validTo || "",
                })}
              >
                {({ startTime, endTime }) => {
                  return (
                    <>
                      <form.Field name="validFrom">
                        {(field) => (
                          <div className="space-y-2 col-span-1">
                            <Label>Thời gian bắt đầu</Label>
                            <Input
                              step={1}
                              max={
                                endTime
                                  ? moment
                                      .tz(endTime, "Asia/Ho_Chi_Minh")
                                      .format("YYYY-MM-DDTHH:mm:ss")
                                  : undefined
                              }
                              defaultValue={
                                startTime
                                  ? moment
                                      .tz(startTime, "Asia/Ho_Chi_Minh")
                                      .format("YYYY-MM-DDTHH:mm:ss")
                                  : undefined
                              }
                              onChange={(e) => {
                                field.handleChange(
                                  moment(e.target.value).utc().format()
                                );
                              }}
                              type="datetime-local"
                            />
                            {field.state.meta.isTouched &&
                              field.state.meta.errors.length > 0 && (
                                <p className="text-xs text-red-500">
                                  {field.state.meta.errors.join(", ")}
                                </p>
                              )}
                          </div>
                        )}
                      </form.Field>
                      <form.Field name="validTo">
                        {(field) => (
                          <div className="space-y-2 col-span-1">
                            <Label>Thời gian kết thúc</Label>
                            <Input
                              step={1}
                              min={
                                startTime
                                  ? moment
                                      .tz(startTime, "Asia/Ho_Chi_Minh")
                                      .format("YYYY-MM-DDTHH:mm:ss")
                                  : undefined
                              }
                              defaultValue={
                                endTime
                                  ? moment
                                      .tz(endTime, "Asia/Ho_Chi_Minh")
                                      .format("YYYY-MM-DDTHH:mm:ss")
                                  : undefined
                              }
                              onChange={(e) => {
                                field.handleChange(
                                  moment(e.target.value).utc().format()
                                );
                              }}
                              type="datetime-local"
                            />
                            {field.state.meta.isTouched &&
                              field.state.meta.errors.length > 0 && (
                                <p className="text-xs text-red-500">
                                  {field.state.meta.errors.join(", ")}
                                </p>
                              )}
                          </div>
                        )}
                      </form.Field>
                    </>
                  );
                }}
              </form.Subscribe>
              <form.Field
                name="quantity"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Số lượng</Label>
                    <Input
                      id={field.name}
                      type="number"
                      placeholder="Số lượng voucher"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(+e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-xs text-red-500">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    <p className="text-xs text-muted-foreground">
                      Số lượng bằng 0 đồng nghĩa với không giới hạn số lượng
                    </p>
                  </div>
                )}
              />

              <form.Field
                name="used"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Số lượng đã dùng</Label>
                    <Input
                      id={field.name}
                      type="number"
                      placeholder="Số lượng voucher"
                      value={field.state.value || 0}
                      disabled
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-xs text-red-500">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                  </div>
                )}
              />
            </div>
            <form.Field
              name="description"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Mô tả</Label>
                  <Input
                    id={field.name}
                    placeholder="Giảm thêm 20% cho các sản phẩm Balo hoặc túi khi mua các sản phẩm có giá từ 850k trở lên"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-red-500">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                </div>
              )}
            />
          </div>

          {/* Condition 1 Section */}
          <div className="space-y-6 p-4 bg-muted/30 rounded-lg">
            <form.Field
              name="condition.operator"
              children={(field) => (
                <div className="space-y-2">
                  <Label>[Điều kiện áp dụng voucher]</Label>
                  <RadioGroup
                    value={field.state.value || "and"}
                    onValueChange={(v) => field.handleChange(v as "and" | "or")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="or" id="or" />
                      <Label className="text-muted-foreground" htmlFor="or">
                        Sản phẩm thuộc danh mục/sản phẩm{" "}
                        <b className="text-red-500">HOẶC</b> đạt tổng giá trị
                        tối thiểu <b className="text-red-500">HOẶC</b> đơn hàng
                        thuộc nội thành và đạt tổng giá trị tối thiểu
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="and" id="and" />
                      <Label className="text-muted-foreground" htmlFor="and">
                        Sản phẩm thuộc danh mục/sản phẩm{" "}
                        <b className="text-red-500">VÀ</b> đạt tổng giá trị tối
                        thiểu <b className="text-red-500">HOẶC</b> đơn hàng
                        thuộc nội thành và đạt tổng giá trị tối thiểu
                      </Label>
                    </div>
                  </RadioGroup>
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-red-500">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                </div>
              )}
            />
            <p className="text-sm text-muted-foreground">
              Chọn danh mục và sản phẩm cần có để sử dụng voucher/coupon (Nếu
              không cài đặt thì xem như là áp dụng cho toàn bộ sản phẩm)
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label className="mb-2 block">Chọn danh mục</Label>
                <form.Field
                  name="condition.categoryIds"
                  children={(field) => (
                    <div className="space-y-2">
                      <CategorySelector
                        value={field.state.value || []}
                        onChange={(categories) => {
                          field.handleChange(categories.map((c) => c.value));
                        }}
                      />
                      {field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0 && (
                          <p className="text-xs text-red-500">
                            {field.state.meta.errors.join(", ")}
                          </p>
                        )}
                    </div>
                  )}
                />
              </div>

              <div>
                <Label className="mb-2 block">Chọn sản phẩm</Label>
                <form.Field
                  name="condition.productIds"
                  children={(field) => (
                    <div className="space-y-2">
                      <ProductSelector
                        multiple
                        value={field.state.value || []}
                        onChange={(productIds) =>
                          field.handleChange(productIds)
                        }
                      />
                      <ArrayChipProduct
                        prdIds={field.state.value || []}
                        onDelete={(id) =>
                          field.handleChange(
                            field.state.value?.filter((v) => v !== id)
                          )
                        }
                      />
                      {field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0 && (
                          <p className="text-xs text-red-500">
                            {field.state.meta.errors.join(", ")}
                          </p>
                        )}
                    </div>
                  )}
                />
              </div>
            </div>
            <form.Field name="condition.minTotal">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Tổng giá trị tối thiểu</Label>
                  <Input
                    id={field.name}
                    type="number"
                    placeholder="Tổng giá trị tối thiểu"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(+e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <p className="ml-2 text-xs text-muted-foreground">
                    {formatCurrency(field.state.value)}
                  </p>
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <p className=" text-xs text-red-500">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                </div>
              )}
            </form.Field>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label className="mb-2 block">Chọn Tỉnh thành</Label>
                <form.Field
                  name="condition.deliveryLocation.provinceCodes"
                  children={(field) => (
                    <div className="space-y-2">
                      <ProvinceSelector
                        value={field.state.value || []}
                        onChange={(codes) => {
                          field.handleChange(codes);
                        }}
                      />
                      {field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0 && (
                          <p className="text-xs text-red-500">
                            {field.state.meta.errors.join(", ")}
                          </p>
                        )}
                    </div>
                  )}
                />
              </div>

              <form.Field name="condition.deliveryLocation.minTotal">
                {(field) => (
                  <div>
                    <Label className="mb-2 block" htmlFor={field.name}>
                      Tổng giá trị tối thiểu cho đơn nội thành
                    </Label>
                    <Input
                      id={field.name}
                      type="number"
                      placeholder="Tổng giá trị tối thiểu"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(+e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <p className="ml-2 text-xs text-muted-foreground mt-2">
                      {formatCurrency(field.state.value)}
                    </p>
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className=" text-xs text-red-500">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>
            </div>
          </div>

          {/* Condition 2 Section */}
          <div className="space-y-6 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Chọn danh mục và sản phẩm để áp dụng voucher/coupon, hoặc cài đặt
              riêng lẻ cho từng sản phẩm
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label className="mb-2 block">Chọn danh mục</Label>
                <form.Field
                  name="applyOn.categoryIds"
                  children={(field) => (
                    <div className="space-y-2">
                      <CategorySelector
                        value={field.state.value || []}
                        onChange={(categories) => {
                          field.handleChange(categories.map((c) => c.value));
                        }}
                      />
                      {field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0 && (
                          <p className="text-xs text-red-500">
                            {field.state.meta.errors.join(", ")}
                          </p>
                        )}
                    </div>
                  )}
                />
              </div>

              <div>
                <Label className="mb-2 block">Chọn sản phẩm</Label>
                <form.Field
                  name="applyOn.productIds"
                  children={(field) => (
                    <div className="space-y-2">
                      <ProductSelector
                        multiple
                        value={field.state.value}
                        onChange={(productIds) =>
                          field.handleChange(productIds)
                        }
                      />
                      <ArrayChipProduct
                        prdIds={field.state.value || []}
                        onDelete={(id) =>
                          field.handleChange(
                            field.state.value?.filter((v) => v !== id)
                          )
                        }
                      />
                      {field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0 && (
                          <p className="text-xs text-red-500">
                            {field.state.meta.errors.join(", ")}
                          </p>
                        )}
                    </div>
                  )}
                />
              </div>
            </div>

            <Table className="border max-sm:block max-sm:max-w-full max-sm:overflow-x-auto">
              <TableHeader>
                <TableRow>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell>Loại giảm giá</TableCell>
                  <TableCell>Giá trị giảm</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHeader>
              <form.Field name="applyOn.addOnDeals" mode="array">
                {(field) => (
                  <TableBody>
                    {field.state.value?.map((_, index) => (
                      <TableRow key={index}>
                        <TableCell className="align-top pt-4">
                          <form.Field
                            name={`applyOn.addOnDeals[${index}].productId`}
                          >
                            {(productField) => (
                              <ProductSelector
                                value={productField.state.value}
                                onChange={(productId) =>
                                  productField.handleChange(productId)
                                }
                              />
                            )}
                          </form.Field>
                          <form.Field
                            name={`applyOn.addOnDeals[${index}].isAppliedToAllVariants`}
                          >
                            {(productField) => (
                              <div className="flex items-center gap-3 mt-2">
                                <Checkbox
                                  checked={productField.state.value}
                                  onCheckedChange={(v) =>
                                    productField.handleChange(v as boolean)
                                  }
                                  id="isAppliedToAllVariants"
                                />

                                <Label htmlFor="isAppliedToAllVariants">
                                  Áp dụng cho toàn bộ variants
                                </Label>
                              </div>
                            )}
                          </form.Field>
                        </TableCell>
                        <TableCell className="align-top pt-4">
                          <form.Field
                            name={`applyOn.addOnDeals[${index}].type`}
                          >
                            {(typeField) => (
                              <Select
                                value={typeField.state.value}
                                onValueChange={(value) =>
                                  typeField.handleChange(value as VoucherType)
                                }
                              >
                                <SelectTrigger className="min-w-max">
                                  <SelectValue placeholder="Giảm thêm" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percent">
                                    Giảm giá theo %
                                  </SelectItem>
                                  <SelectItem value="fixed-amount">
                                    Giảm giá cố định
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </form.Field>
                        </TableCell>
                        <TableCell className="pt-4">
                          <form.Field
                            name={`applyOn.addOnDeals[${index}].value`}
                          >
                            {(valueField) => (
                              <>
                                <Input
                                  type="number"
                                  className="min-w-max"
                                  value={valueField.state.value}
                                  onChange={(e) =>
                                    valueField.handleChange(+e.target.value)
                                  }
                                />
                                <form.Field
                                  name={`applyOn.addOnDeals[${index}].type`}
                                >
                                  {({ state }) => (
                                    <p className="ml-2 text-muted-foreground text-xs">
                                      {state.value === "percent"
                                        ? `${valueField.state.value} %`
                                        : formatCurrency(
                                            valueField.state.value
                                          )}
                                    </p>
                                  )}
                                </form.Field>
                              </>
                            )}
                          </form.Field>
                        </TableCell>
                        <TableCell className="align-top pt-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => field.removeValue(index)}
                          >
                            <Trash className="text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="hover:bg-transparent"
                          onClick={() => {
                            field.pushValue({
                              productId: 0,
                              type: "percent",
                              value: 0,
                              isAppliedToAllVariants: true,
                            });
                          }}
                        >
                          <CirclePlus className="text-primary" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </form.Field>
            </Table>
            <p className="text-red-500 text-xs">
              Lưu ý: Đối với cài đặt giá trị giảm riêng cho từng sản phẩm sẽ
              không chịu ảnh hưởng của <b>giá trị giảm</b> đã cài đặt ở trên
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
