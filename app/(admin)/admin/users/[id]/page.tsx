"use client";
import { use } from "react";

import { CalendarIcon, ImageOff, Upload, X } from "lucide-react";

import { APIStatus } from "@/client/callAPI";
import { createUser, getUserById, updateUser } from "@/client/user.client";
import FileManagerDialog from "@/components/file-manager/file-manager-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MultipleSelector from "@/components/ui/multiselect";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getUserAdminQuery } from "@/query/auth.admin.query";
import { useConfigs } from "@/store/useConfig";
import { AdminUser } from "@/types/user";
import { getDirtyData, sleep } from "@/utils";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserProfileSkeleton } from "./user-skeleton";

export default function AccountDetails(props: {
  params: Promise<{
    id: string;
  }>;
}) {
  const params = use(props.params);
  const configs = useConfigs((s) => s.configs);
  const { id } = params;
  const PERMISSIONS = configs?.["PERMISSIONS"] as Record<string, string>;
  const { toast } = useToast();
  const router = useRouter();
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      if (!id || id === "new") return null;
      const res = await getUserById(id);
      if (res.status !== APIStatus.OK || !res.data) return null;
      return res.data;
    },
  });
  const { data: loggedUser } = useQuery(getUserAdminQuery);

  const form = useForm<Omit<AdminUser, "deletedAt">>({
    defaultValues: user
      ? user
      : {
          _id: "",
          phoneNumber: "",
          email: "",
          facebookId: "",
          telegramId: "",
          password: "",
          fullName: "",
          quote: "",
          dateOfBirth: moment().format("DD/MM/YYYY"),
          gender: "MALE",
          status: "ACTIVE",
          permissions: [],
          photo: "",
        },
    onSubmit: async ({ value }) => {
      if (id === "new" || !id) {
        // create new user
        const { _id, ...valueWithoutId } = value;
        const res = await createUser(valueWithoutId);
        if (res.status === APIStatus.OK && res.data) {
          toast({
            title: "Tạo tài khoản thành công",
            description: `Tài khoản  đã được tạo thành công!`,
          });
          await sleep(2000);
          router.push(`/admin/users/${res.data._id}`);
        } else {
          toast({
            title: "Tạo tài khoản thất bại",
            description: res.message,
            variant: "error",
          });
        }
      } else {
        // update user
        const dirtyData = getDirtyData(user, value);
        const res = await updateUser(id, value);
        if (res.status === APIStatus.OK && res.data) {
          toast({
            title: "Cập nhật tài khoản thành công",
            description: `Tài khoản  đã được cập nhật thành công!`,
          });
          window.location.reload();
        } else {
          toast({
            title: "Cập nhật tài khoản thất bại",
            description: res.message,
            variant: "error",
          });
        }
      }
    },
  });

  if (isLoading) return <UserProfileSkeleton />;
  const isAllowChangePassword =
    loggedUser?.permissions?.includes("ADMIN_UPDATE");
  return (
    <Card className="m-2 sm:m-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-2xl font-bold">Sửa tài khoản</CardTitle>
        <Button onClick={form.handleSubmit}>Lưu</Button>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Trạng thái</Label>
            <p className="text-sm text-muted-foreground">
              Trạng thái tài khoản
            </p>
          </div>
          <form.Field
            name="status"
            children={(field) => (
              <Switch
                checked={field.state.value === "ACTIVE"}
                onCheckedChange={(v) =>
                  field.handleChange(v ? "ACTIVE" : "INACTIVE")
                }
              />
            )}
          />
        </div>
        <div className="grid gap-8 md:grid-cols-[1fr,200px]">
          <div className="space-y-4">
            <form.Field
              name="fullName"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />
            <div
              className={cn(
                "grid gap-4 md:grid-cols-2",
                !id || id === "new" ? "md:grid-cols-2" : "md:grid-cols-1"
              )}
            >
              <form.Field
                name="email"
                children={(field) => (
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      disabled={!!id && id !== "new"}
                      value={field.state.value || ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />
              <form.Field
                name="password"
                children={(field) => (
                  <div
                    className={cn(
                      "space-y-2",
                      !id || isAllowChangePassword || id === "new"
                        ? "block"
                        : "hidden"
                    )}
                  >
                    <Label>Mật khẩu</Label>
                    <Input
                      value={field.state.value || ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <form.Field
                name="facebookId"
                children={(field) => (
                  <div className="space-y-2">
                    <Label>Facebook ID</Label>
                    <Input
                      value={field.state.value || ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />

              <form.Field
                name="telegramId"
                children={(field) => (
                  <div className="space-y-2">
                    <Label>Telegram ID</Label>
                    <Input
                      value={field.state.value || ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />
            </div>

            <form.Field
              name="phoneNumber"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />
          </div>

          <div className="space-y-4">
            <form.Field
              name="photo"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Ảnh đại diện</Label>
                  <div className="relative  aspect-square">
                    {field.state.value ? (
                      <>
                        <Image
                          src={field.state.value || ""}
                          alt="Avatar"
                          width={200}
                          height={200}
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="absolute top-2 right-2 h-6 w-6 bg-background"
                          onClick={() => field.handleChange("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="w-full h-full bg-background rounded-lg border flex items-center justify-center">
                          <ImageOff className="w-1/2 h-1/2 object-cover rounded-lg text-neutral-100" />

                          <FileManagerDialog
                            singleSelect
                            onSelect={(file) => field.handleChange(file)}
                          >
                            <Button
                              type="button"
                              variant="outline"
                              className="absolute bottom-2 right-2 bg-background"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </Button>
                          </FileManagerDialog>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        <form.Field
          name="quote"
          children={(field) => (
            <div className="space-y-2">
              <Label>Quote</Label>
              <Textarea
                value={field.state.value || ""}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        />
        <form.Field name="permissions">
          {(field) => {
            return (
              <div className="space-y-2">
                <Label>Quyền </Label>
                <MultipleSelector
                  commandProps={{
                    label: "Chọn quyền",
                  }}
                  value={field.state.value
                    .map((v) => ({
                      value: v,
                      label: PERMISSIONS[v],
                    }))
                    .filter((v) => v.label)}
                  defaultOptions={Object.keys(PERMISSIONS).map((key) => ({
                    value: key,
                    label: PERMISSIONS[key],
                  }))}
                  onChange={(p) => field.handleChange(p.map((p) => p.value))}
                  placeholder="Chọn quyền"
                  hideClearAllButton
                  hidePlaceholderWhenSelected
                  emptyIndicator={
                    <p className="text-center text-sm">No results found</p>
                  }
                />
              </div>
            );
          }}
        </form.Field>

        <div className="grid gap-8 md:grid-cols-3">
          <form.Field
            name="dateOfBirth"
            children={(field) => (
              <div className="space-y-2">
                <Label>Ngày sinh</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.state.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.state.value
                        ? moment(field.state.value).format("DD/MM/YYYY")
                        : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      defaultMonth={
                        field.state.value
                          ? new Date(field.state.value)
                          : new Date()
                      }
                      selected={
                        field.state.value
                          ? new Date(field.state.value)
                          : new Date()
                      }
                      onSelect={(date) =>
                        field.handleChange(moment(date).format())
                      }
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          />

          <form.Field
            name="gender"
            children={(field) => (
              <div className="space-y-2">
                <Label>Giới tính</Label>
                <RadioGroup
                  onValueChange={field.handleChange}
                  value={field.state.value}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FEMALE" id="female" />
                    <label htmlFor="female">Nữ</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MALE" id="male" />
                    <label htmlFor="male">Nam</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="OTHER" id="other" />
                    <label htmlFor="other">Khác</label>
                  </div>
                </RadioGroup>
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
