"use client";
import { APIStatus } from "@/client/callAPI";
import { createEmbed, getEmbed, updateEmbed } from "@/client/embed.client";
import AceEmmetEditor from "@/components/ace-editor";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { EmbedPosition } from "@/types/embed";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { notFound, useParams, useRouter } from "next/navigation";
import PageSelector from "./page-selector";

export default function EmbedCodeForm() {
  const params = useParams();
  const { toast } = useToast();
  const router = useRouter();
  const id = params.id as string;
  const { data: embed, isLoading } = useQuery({
    queryKey: ["getEmbed", id],
    queryFn: async () => {
      if (!id || id === "new") return null;
      const res = await getEmbed(id);
      if (res.status !== APIStatus.OK) notFound();
      return res.data!;
    },
  });

  const form = useForm({
    defaultValues: {
      name: embed?.name || "Chưa đặt tên",
      isActive: embed?.isActive ?? true,
      position: embed?.position || EmbedPosition.HEAD,
      pages: embed?.scope?.length ? "specific-pages" : "entire-website",
      scope: embed?.scope,
      code: embed?.code,
    },
    onSubmit: async ({ value }) => {
      if (!id || id === "new") {
        const res = await createEmbed({
          name: value.name,
          isActive: value.isActive,
          position: value.position,
          scope: value.pages === "entire-website" ? [] : value.scope,
          code: value.code,
        });
        if (res.status !== APIStatus.OK || !res.data) {
          toast({
            title: "Có lỗi xảy ra",
            description: "Không thể tạo thẻ",
            variant: "error",
          });
          return;
        }
        toast({
          title: "Tạo thẻ thành công",
        });
        router.push(`/admin/settings/embeds/${res?.data._id}`);
        return;
      }
      const res = await updateEmbed(id, {
        name: value.name,
        isActive: value.isActive,
        position: value.position,
        scope: value.pages === "entire-website" ? [] : value.scope,
        code: value.code,
      });
      if (res.status !== APIStatus.OK) {
        toast({
          title: "Có lỗi xảy ra",
          description: "Không thể cập nhật thẻ",
          variant: "error",
        });
        return;
      }
      toast({
        title: "Cập nhật thẻ thành công",
      });
    },
  });

  return (
    <>
      <PageBreadCrumb
        breadcrumbs={[
          { name: "Danh sách Embed", href: "/admin/settings/embeds" },
          { name: !id || id === "new" ? "Tạo Embed" : "Chi tiết Embed" },
        ]}
      />
      <Card className="space-y-6 p-2 sm:p-6 m-2 ">
        <div className="flex items-center justify-between border-b pb-4">
          <form.Field
            name="name"
            children={(field) => (
              <h1 className="text-2xl font-semibold">
                {field.state.value || "Chưa đặt tên"}
              </h1>
            )}
          />
          <Button onClick={form.handleSubmit} variant="default">
            {!id || id === "new" ? "Tạo" : "Cập nhật"}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="status">Trạng thái</Label>
          <form.Field
            name="isActive"
            children={(field) => (
              <Switch
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked)}
                aria-label="Toggle status"
              />
            )}
          />
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Tên</Label>
            <form.Field
              name="name"
              children={(field) => (
                <Input
                  id="name"
                  placeholder="Đặt tên cho thẻ"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Vị trí</Label>
            <form.Field
              name="position"
              children={(field) => (
                <RadioGroup
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as EmbedPosition)
                  }
                  className="flex gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={EmbedPosition.HEAD}
                      id="before-head"
                    />
                    <Label htmlFor="before-head" className="font-normal">
                      Thẻ Head
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={EmbedPosition.BODY}
                      id="before-body"
                    />
                    <Label htmlFor="before-body" className="font-normal">
                      Thẻ Body
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="scope">Mức độ phủ của thẻ</Label>
            <form.Field
              name="pages"
              children={(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mức độ phủ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entire-website">
                        Toàn bộ website
                      </SelectItem>
                      <SelectItem value="specific-pages">
                        Một số trang nhất định
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {field.state.value === "specific-pages" && (
                    <form.Field
                      name="scope"
                      children={(field) => (
                        <PageSelector
                          value={field.state.value || []}
                          onChange={(value) => field.handleChange(value)}
                        />
                      )}
                    />
                  )}
                </>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <form.Field
              name="code"
              children={(field) => (
                <AceEmmetEditor
                  value={field.state.value || ""}
                  onChange={(value) => field.handleChange(value)}
                />
              )}
            />
          </div>
        </div>
      </Card>
    </>
  );
}
