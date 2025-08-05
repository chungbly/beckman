"use client";
import { APIStatus } from "@/client/callAPI";
import { updateCustomer } from "@/client/customer.client";
import { getExternalOrders } from "@/client/external-order.client";
import VoucherSelector from "@/components/selectors/voucher-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPrimitive,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Customer, Tier } from "@/types/customer";
import { getDirtyData } from "@/utils";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  CalendarIcon,
  ChevronDownIcon,
  Clock,
  LoaderCircle,
  PackageCheck,
  Phone,
  Plus,
  Settings,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import moment from "moment";
import Image from "next/image";

export default function CustomerDetailPage({
  customer,
}: {
  customer: Customer;
}) {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      code: customer.code,
      name: customer.name,
      birthday: customer.birthday || "",
      tier: customer.tier || "",
      phoneNumbers: customer.phoneNumbers || "",
      voucherCodes: customer.voucherCodes || [],
    },
    onSubmit: async ({ value }) => {
      const dirtyData = getDirtyData(customer, value);
      const res = await updateCustomer(customer._id, dirtyData);
      if (res.status !== APIStatus.OK || !res.data) {
        return toast({
          title: "Lỗi",
          description: res.message || "Đã có lỗi xảy ra",
          variant: "error",
        });
      }
      toast({
        title: "Thành công",
        description: "Cập nhật thành công",
      });
    },
  });

  const { data: externalOrders, isLoading } = useQuery({
    queryKey: ["external-orders", customer.code],
    queryFn: async () => {
      const res = await getExternalOrders(
        {
          customerCodes: [customer.code],
        },
        100,
        1
      );
      return res.data || [];
    },
  });

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "regular":
        return "bg-green-100 text-green-800";
      case "vip":
        return "bg-purple-100 text-purple-800";
      case "premium":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <form.Subscribe
            selector={(state) => ({
              name: state.values.name,
              code: state.values.code,
              tier: state.values.tier,
            })}
          >
            {({ name, code, tier }) => (
              <>
                <h1 className="text-3xl font-bold">{name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="font-mono">
                    {code}
                  </Badge>
                  <Badge className={getTierColor(tier)} variant="secondary">
                    <Award className="h-3 w-3 mr-1" />
                    {tier.toUpperCase()}
                  </Badge>
                </div>
              </>
            )}
          </form.Subscribe>
        </div>

        <div className="mt-4 md:mt-0">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button onClick={form.handleSubmit} disabled={!canSubmit}>
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}

        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
            <CardDescription>Thông tin cơ bản của khách hàng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.Field
              name="code"
              children={(field) => (
                <div>
                  <p className="text-sm font-medium  mb-1">Customer Code</p>
                  <Input
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    className="font-mono"
                  />
                </div>
              )}
            />

            <form.Field
              name="name"
              children={(field) => (
                <div>
                  <p className="text-sm font-medium  mb-1">Name</p>
                  <Input
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    className="font-mono"
                  />
                </div>
              )}
            />

            <form.Field
              name="birthday"
              children={(field) => (
                <div className="space-y-2">
                  <p className="text-sm font-medium  mb-1">Birthday</p>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 " />
                    <div className="flex flex-col gap-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            id="date"
                            className="w-48 justify-between font-normal"
                          >
                            {field.state.value
                              ? moment(field.state.value, "DD/MM/yyyy").format(
                                  "DD/MM/yyyy"
                                )
                              : "Chọn ngày"}
                            <ChevronDownIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            defaultMonth={
                              field.state.value
                                ? moment(
                                    field.state.value,
                                    "DD/MM/yyyy"
                                  ).toDate()
                                : new Date()
                            }
                            selected={
                              field.state.value
                                ? moment(
                                    field.state.value,
                                    "DD/MM/yyyy"
                                  ).toDate()
                                : new Date()
                            }
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              field.handleChange(
                                moment(date).format("DD/MM/yyyy")
                              );
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              )}
            />

            <form.Field
              name="phoneNumbers"
              mode="array"
              children={(field) => (
                <div>
                  <p className="text-sm font-medium  mb-1">Phone</p>
                  <div className="space-y-2">
                    {field.state.value.map((_, i) => {
                      return (
                        <form.Field key={i} name={`phoneNumbers[${i}]`}>
                          {(subField) => {
                            return (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 " />
                                <Input
                                  value={subField.state.value}
                                  onChange={(e) => {
                                    subField.handleChange(e.target.value);
                                  }}
                                  className="font-mono"
                                />
                              </div>
                            );
                          }}
                        </form.Field>
                      );
                    })}
                    <Plus
                      className="text-primary"
                      onClick={() => field.pushValue("")}
                    />
                  </div>
                </div>
              )}
            />
          </CardContent>
        </Card>

        {/* Record Information section remains unchanged */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái</CardTitle>
            <CardDescription>
              Hạng thành viên,voucher codes và đơn hàng của khách hàng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <form.Field name="tier">
                {(field) => {
                  const tier = field.state.value;
                  return (
                    <>
                      <Select
                        value={tier || Tier.NEW}
                        onValueChange={(value) => {
                          field.handleChange(value as Tier);
                        }}
                      >
                        <SelectPrimitive.Trigger className="max-w-fit" asChild>
                          <div className="flex gap-2 items-center text-sm font-medium  mb-1">
                            <Award className="h-4 w-4 " />
                            Hạng thành viên
                            <Settings
                              size={18}
                              className="text-black hover:cursor-pointer"
                            />
                          </div>
                        </SelectPrimitive.Trigger>
                        <SelectContent>
                          <SelectItem value={Tier.NEW}>
                            <Badge
                              className={getTierColor(Tier.NEW)}
                              variant="secondary"
                            >
                              <Award className="h-3 w-3 mr-1" />
                              Thành viên mới
                            </Badge>
                          </SelectItem>
                          <SelectItem value={Tier.MEMBER}>
                            <Badge
                              className={getTierColor(Tier.MEMBER)}
                              variant="secondary"
                            >
                              <Award className="h-3 w-3 mr-1" />
                              Thành viên
                            </Badge>
                          </SelectItem>
                          <SelectItem value={Tier.VIP}>
                            <Badge
                              className={getTierColor(Tier.VIP)}
                              variant="secondary"
                            >
                              <Award className="h-3 w-3 mr-1" />
                              Thành viên VIP
                            </Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="relative w-full aspect-[600/388] sm:w-[300px] sm:h-[194px] rounded-lg">
                        <Image
                          src={
                            tier === Tier.VIP
                              ? "/icons/vip.svg"
                              : tier === Tier.MEMBER
                              ? "/icons/member.svg"
                              : "/icons/new_member.svg"
                          }
                          fill
                          alt="member-tier"
                          className="object-contain"
                          priority
                        />
                        <div className="absolute bottom-8 left-8 text-white">
                          <p className="text-sm sm:text-xl">Khách hàng</p>
                          <p className="text-xl sm:text-2xl font-bold">
                            {customer.name || customer.phoneNumbers?.[0]}
                          </p>
                        </div>
                      </div>
                    </>
                  );
                }}
              </form.Field>
            </div>

            <div>
              <p className="text-sm font-medium  mb-1">Voucher Codes</p>
              <form.Field name="voucherCodes">
                {(field) => {
                  const voucherCodes = field.state.value;

                  return (
                    <>
                      <VoucherSelector
                        multiple
                        value={voucherCodes}
                        onChange={(v) => {
                          field.handleChange(v);
                        }}
                      />
                      {voucherCodes.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {voucherCodes.map((code, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Tag className="h-3 w-3" />
                              {code}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  field.handleChange(
                                    voucherCodes.filter((c) => c !== code)
                                  );
                                }}
                              />
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm  italic">
                          Chưa có voucher code nào
                        </p>
                      )}
                    </>
                  );
                }}
              </form.Field>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center">
                <LoaderCircle className="animate-spin" />
              </div>
            ) : (
              <>
                <p className="text-sm font-medium  mb-1">Đơn hàng</p>
                <div className="grid grid-cols-4 gap-2">
                  {!!externalOrders?.length ? (
                    externalOrders.map((order) => (
                      <Badge
                        key={order._id}
                        variant="outline"
                        className="flex items-center gap-1 w-fit"
                      >
                        <PackageCheck className="h-3 w-3" />
                        {order.code}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm  italic">Chưa có đơn hàng nào</p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Thông tin hệ thống</CardTitle>
          <CardDescription>Thông tin hệ thống của khách hàng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium  mb-1">ID</p>
              <p className="font-mono text-xs break-all">{customer._id}</p>
            </div>

            <div>
              <p className="text-sm font-medium  mb-1">Trạng thái</p>
              {customer.deletedAt ? (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Deleted
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  Active
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium  mb-1">Tạo lúc</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 " />
                <p>{moment(customer.createdAt).format("dd/MM/yyyy")}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium  mb-1">Cập nhật lần cuối</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 " />
                <p>{moment(customer.updatedAt).format("DD/MM/yyyy")}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 flex justify-end">
          <div className="text-xs ">
            Chỉnh sửa lần cuối:{" "}
            {moment(customer.updatedAt).format("DD/MM/yyyy")}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
