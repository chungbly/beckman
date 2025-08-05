"use client";
import { APIStatus } from "@/client/callAPI";
import {
  getDistricts,
  getProvinces,
  getWards,
} from "@/client/master-data.client";
import { AutoComplete } from "@/components/ui/auto-complete";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
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
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { orderStages } from "./[id]/order-timeline";

const WithLabel = ({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-1 min-w-max", className)}>
    <label className="text-xs font-semibold">{label}</label>
    {children}
  </div>
);

type Filter = {
  customerName: string;
  code: string;
  status: string;
  phoneNumber: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  updatedStartDate: string;
  updatedEndDate: string;
  createdStartDate: string;
  createdEndDate: string;
};

export const DistrictSelector = ({
  provinceCode,
  value,
  onChange,
}: {
  provinceCode?: number;
  value: number;
  onChange: (value: { value: number; label: string }) => void;
}) => {
  const { data: districts, isLoading } = useQuery({
    queryKey: ["districts", provinceCode],
    queryFn: async () => {
      if (!provinceCode) return [];
      const res = await getDistricts(provinceCode);
      if (res.status !== APIStatus.OK || !res.data) return [];
      return res.data.map((d) => ({
        value: d.DistrictID,
        label: d.DistrictName,
      }));
    },
  });

  return (
    <AutoComplete
      value={districts?.filter((d) => d.value === value)[0]}
      options={districts ?? []}
      isLoading={isLoading}
      multiple={false}
      placeholder="Chọn Quận/Huyện"
      onChange={(v) => onChange(v)}
    />
  );
};

export const WardSelector = ({
  districtCode,
  value,
  onChange,
}: {
  districtCode?: number;
  value: string;
  onChange: (value: { value: string; label: string }) => void;
}) => {
  const { data: wards, isLoading } = useQuery({
    queryKey: ["wards", districtCode],
    queryFn: async () => {
      if (!districtCode) return [];
      const res = await getWards(districtCode);
      if (res.status !== APIStatus.OK || !res.data) return [];
      return res.data.map((d) => ({
        value: d.WardCode,
        label: d.WardName,
      }));
    },
  });

  return (
    <AutoComplete
      value={wards?.filter((d) => d.value === value)[0]}
      options={wards ?? []}
      isLoading={isLoading}
      multiple={false}
      placeholder="Chọn Xã/Phường"
      onChange={(v) => onChange(v)}
    />
  );
};

function OrderFilter() {
  const router = useRouter();
  const form = useForm<Filter>({
    defaultValues: {
      customerName: "",
      status: "all",
      code: "",
      phoneNumber: "",
      provinceCode: "",
      districtCode: "",
      wardCode: "",
      updatedStartDate: "",
      updatedEndDate: "",
      createdStartDate: "",
      createdEndDate: "",
    },
    onSubmit: ({ value }) => {
      router.push(
        `/admin/orders?${serialize(
          sanitizeObject({
            ...value,
            status: value.status === "all" ? undefined : value.status,
          })
        )}`
      );
    },
  });

  const { data: provinces, isLoading } = useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const res = await getProvinces();
      if (res.status !== APIStatus.OK || !res.data) return [];
      return res.data.map((p) => ({
        value: p.ProvinceID,
        label: p.ProvinceName,
      }));
    },
  });

  return (
    <form
      className="bg-white shadow-sm rounded-sm p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <WithLabel className="col-span-1" label="Mã đơn">
        <form.Field
          name="code"
          children={(field) => (
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border border-gray-300 rounded-sm py-2 px-3"
              placeholder="Tìm theo mã đơn hàng"
            />
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Tên khách hàng">
        <form.Field
          name="customerName"
          children={(field) => (
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border border-gray-300 rounded-sm py-2 px-3"
              placeholder="Tìm theo tên khách hàng"
            />
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Số điện thoại">
        <form.Field
          name="phoneNumber"
          children={(field) => (
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border border-gray-300 rounded-sm py-2 px-3"
              placeholder="Tìm theo SĐT"
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
                {orderStages.map((stage) => (
                  <SelectItem key={stage.key} value={stage.key}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Tỉnh/thành phố">
        <form.Field
          name="provinceCode"
          children={(field) => (
            <AutoComplete
              value={
                provinces?.filter((p) => p.value === +field.state.value)[0]
              }
              options={provinces ?? []}
              isLoading={isLoading}
              placeholder="Chọn Tỉnh/Thành phố"
              onChange={(v) => {
                field.handleChange(v.value.toString());
                form.setFieldValue("districtCode", "");
                form.setFieldValue("wardCode", "");
              }}
            />
          )}
        />
      </WithLabel>

      <WithLabel className="col-span-1" label="Quận/huyện">
        <form.Field
          name="districtCode"
          children={(field) => (
            <form.Field
              name="provinceCode"
              children={(provinceCode) => (
                <DistrictSelector
                  provinceCode={+provinceCode.state.value}
                  value={+field.state.value}
                  onChange={(v) => {
                    field.handleChange(v.value?.toString());
                    form.setFieldValue("wardCode", "");
                  }}
                />
              )}
            />
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Xã">
        <form.Field
          name="wardCode"
          children={(field) => (
            <form.Field
              name="districtCode"
              children={(districtField) => (
                <WardSelector
                  districtCode={+districtField.state.value}
                  value={field.state.value}
                  onChange={(v) => {
                    field.handleChange(v.value);
                  }}
                />
              )}
            />
          )}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Thời gian tạo đơn hàng">
        <form.Subscribe
          selector={(state) => ({
            from: state.values.createdStartDate || "",
            to: state.values.createdEndDate || "",
          })}
          children={({ from, to }) => {
            const value = {
              from: from ? new Date(from) : undefined,
              to: to ? new Date(to) : undefined,
            };
            return (
              <DatePickerWithRange
                value={value}
                onChange={(value) => {
                  form.setFieldValue(
                    "createdStartDate",
                    value?.from ? value.from.toISOString() : ""
                  );
                  form.setFieldValue(
                    "createdEndDate",
                    value?.to ? value.to.toISOString() : ""
                  );
                }}
              />
            );
          }}
        />
      </WithLabel>
      <WithLabel className="col-span-1" label="Thời gian cập nhật đơn hàng">
        <form.Subscribe
          selector={(state) => ({
            from: state.values.updatedStartDate || "",
            to: state.values.updatedEndDate || "",
          })}
          children={({ from, to }) => {
            const value = {
              from: from ? new Date(from) : undefined,
              to: to ? new Date(to) : undefined,
            };
            return (
              <DatePickerWithRange
                value={value}
                onChange={(value) => {
                  form.setFieldValue(
                    "updatedStartDate",
                    value?.from ? value.from.toISOString() : ""
                  );
                  form.setFieldValue(
                    "updatedEndDate",
                    value?.to ? value.to.toISOString() : ""
                  );
                }}
              />
            );
          }}
        />
      </WithLabel>

      <div className="cols-span-1 sm:col-span-2 xl:col-span-4  gap-4 flex justify-end">
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

export default OrderFilter;
