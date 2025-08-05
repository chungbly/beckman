"use client";
import { APIStatus } from "@/client/callAPI";
import { updateConfig } from "@/client/configs.client";
import FileManagerDialog from "@/components/file-manager/file-manager-dialog";
import FlashDeal from "@/components/pages/client/home-page/flash-deal/flash-deal";
import FlashDealSkeleton from "@/components/pages/client/home-page/flash-deal/flash-deal-skeleton";
import ProductSelector, { ArrayChipProduct } from "@/components/selectors/product-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getProductsQuery } from "@/query/product.query";
import { FlashDeal as TFlashDeal } from "@/types/flash-deal";
import { useForm } from "@tanstack/react-form";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ImagePlus, Save } from "lucide-react";
import moment from "moment-timezone";
import Image from "next/image";
import { useState } from "react";

export default function FlashDealEditor({
  initialData,
}: {
  initialData: TFlashDeal;
}) {
  const { toast } = useToast();
  const [productIds, setProductIds] = useState<number[]>(
    initialData?.productIds || []
  );

  const { data: products, isLoading } = useQuery({
    ...getProductsQuery(
      {
        ids: productIds,
        status: true,
      },
      productIds?.length,
      1
    ),
    enabled: !!productIds.length,
    placeholderData: keepPreviousData,
  });

  const form = useForm({
    defaultValues: initialData,
    onSubmit: async ({ value }) => {
      const res = await updateConfig("FLASH_DEAL", JSON.stringify(value));
      if (res?.status !== APIStatus.OK) {
        return toast({
          description: res?.message || "Lỗi khi lưu Flash Deal",
          variant: "error",
        });
      }
      toast({
        description: "Lưu thành công",
        variant: "success",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Flash Deal
          <Button onClick={form.handleSubmit} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form.Field name="isActive">
          {(field) => (
            <div className="flex items-center justify-between">
              <Label>Kích hoạt</Label>
              <Switch
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked)}
              />
            </div>
          )}
        </form.Field>
        <form.Subscribe
          selector={(state) => ({
            startTime: state.values.startTime || "",
            endTime: state.values.endTime || "",
          })}
        >
          {({ startTime, endTime }) => {
            return (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thời gian bắt đầu</Label>
                  <Input
                    step={1}
                    value={
                      startTime
                        ? moment
                            .tz(startTime, "Asia/Ho_Chi_Minh")
                            .format("YYYY-MM-DDTHH:mm:ss")
                        : undefined
                    }
                    onChange={(e) => {
                      form.setFieldValue(
                        "startTime",
                        moment(e.target.value).utc().format()
                      );
                    }}
                    type="datetime-local"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Thời gian kết thúc</Label>
                  <Input
                    step={1}
                    value={
                      endTime
                        ? moment
                            .tz(endTime, "Asia/Ho_Chi_Minh")
                            .format("YYYY-MM-DDTHH:mm:ss")
                        : undefined
                    }
                    onChange={(e) => {
                      form.setFieldValue(
                        "endTime",
                        moment(e.target.value).utc().format()
                      );
                    }}
                    type="datetime-local"
                  />
                </div>
              </div>
            );
          }}
        </form.Subscribe>
        <form.Field name="productIds">
          {(field) => (
            <div className="space-y-2">
              <Label>Sản phẩm Flash Deal</Label>
              <ProductSelector
                value={field.state.value}
                multiple
                onChange={(ids) => {
                  setProductIds(ids);
                  field.handleChange(ids);
                }}
              />
              <ArrayChipProduct
                prdIds={field.state.value || []}
                onDelete={(id) => {
                  const filtered = (field.state.value ?? []).filter(
                    (p) => p !== id
                  );
                  setProductIds(filtered);
                  field.handleChange(
                    (field.state.value ?? []).filter((p) => p !== id)
                  );
                }}
              />
            </div>
          )}
        </form.Field>
        <form.Field name="showMoreImage">
          {(field) => (
            <div className="space-y-2 w-fit">
              <Label>Ảnh hiển thị thêm</Label>
              <FileManagerDialog
                singleSelect
                onSelect={(url) => field.handleChange(url)}
              >
                <div className="relative h-[300px] w-[200px]">
                  {field.state.value ? (
                    <Image
                      fill
                      src={field.state.value}
                      alt="Ảnh hiển thị thêm"
                      className="rounded-sm w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute w-full cursor-pointer rounded-sm border-dashed border-primary border inset-0 flex items-center justify-center bg-gray-200">
                      <ImagePlus size={50} />
                    </div>
                  )}
                </div>
              </FileManagerDialog>
            </div>
          )}
        </form.Field>
        <form.Field
          name="backgroundColor"
          children={(field) => {
            return (
              <div className="space-y-2">
                <Label>Màu nền</Label>
                <ColorPicker
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              </div>
            );
          }}
        />
        <form.Field name="showMoreLink">
          {(field) => (
            <div className="space-y-2">
              <Label>Link xem thêm</Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Nhập đường dẫn xem thêm"
              />
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.values}>
          {(flashDeal) => {
            if (isLoading) return <FlashDealSkeleton />;
            if (!products?.length) return null;
            return <FlashDeal flashDeal={flashDeal} products={products} />;
          }}
        </form.Subscribe>
      </CardContent>
    </Card>
  );
}
