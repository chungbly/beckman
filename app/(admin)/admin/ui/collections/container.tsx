"use client";

import { APIStatus } from "@/client/callAPI";
import { updateConfig } from "@/client/configs.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "@tanstack/react-form";
import { Plus, Save, Trash2 } from "lucide-react";

export interface CollectionMenu {
  name: string;
  href: string;
}

export default function CollectionsMenu({
  configs,
}: {
  configs: Record<string, any>;
}) {
  const { toast } = useToast();
  const menus = configs["COLLECTIONS_MENU"] as CollectionMenu[];
  const form = useForm({
    defaultValues: {
      menus: menus,
    },
    onSubmit: async ({ value }) => {
      const res = await updateConfig(
        "COLLECTIONS_MENU",
        JSON.stringify(value.menus)
      );
      if (res.status !== APIStatus.OK) {
        toast({
          title: "Lỗi",
          description: res.message,
          variant: "error",
        });
      } else {
        toast({
          title: "Thành công",
          description: "Collections menu updated successfully",
        });
      }
    },
  });

  return (
    <div className="p-6 space-y-8 w-full">
      <PageBreadCrumb breadcrumbs={[{ name: "Collections Menu" }]} />

      <div className="flex w-full items-center justify-between my-4">
        <h1 className="text-3xl font-bold tracking-tight">Collections Menu</h1>
        <Button onClick={form.handleSubmit}>
          <Save className="h-4 w-4 mr-2" /> Lưu
        </Button>
      </div>
      <Card className="shadow-sm border-border mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Menu Items</CardTitle>
          <CardDescription>Quản lí Collections menu</CardDescription>
        </CardHeader>
        <CardContent>
          <form.Field name="menus" mode="array">
            {(field) => {
              return (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => {
                        field.pushValue({ name: "", href: "" });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Thêm menu mới
                    </Button>
                  </div>

                  {field.state.value.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Chưa có menu nào, nhấn vào nút phía trên để thêm.
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {field.state.value.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row md:items-start gap-6 p-6 border rounded-lg bg-card/50 relative group"
                        >
                          <div className="absolute -top-3 -left-3 bg-muted text-muted-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>

                          <div className="flex-1 space-y-4">
                            <form.Field
                              name={`menus[${index}].name`}
                              validators={{
                                onChange: ({ value }) => {
                                  if (!value) return "Name is required";
                                  return undefined;
                                },
                              }}
                            >
                              {(subField) => (
                                <div className="space-y-2">
                                  <Label htmlFor={subField.name}>
                                    Tên menu
                                  </Label>
                                  <Input
                                    id={subField.name}
                                    name={subField.name}
                                    value={subField.state.value}
                                    onChange={(e) =>
                                      subField.handleChange(e.target.value)
                                    }
                                    placeholder="Nhập tên menu"
                                  />
                                  {subField.state.meta.errors ? (
                                    <div className="text-sm text-destructive">
                                      {subField.state.meta.errors.join(", ")}
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </form.Field>

                            <form.Field
                              name={`menus[${index}].href`}
                              validators={{
                                onChange: ({ value }) => {
                                  if (!value) return "Không được bỏ trống";
                                  return undefined;
                                },
                              }}
                            >
                              {(subField) => (
                                <div className="space-y-2">
                                  <Label htmlFor={subField.name}>
                                    Menu URL
                                  </Label>
                                  <Input
                                    id={subField.name}
                                    name={subField.name}
                                    value={subField.state.value}
                                    onChange={(e) =>
                                      subField.handleChange(e.target.value)
                                    }
                                    placeholder="Nhập đường dẫn (e.g., /collections/shoes, hoặc https://www.google.com)"
                                  />
                                  {subField.state.meta.errors ? (
                                    <div className="text-sm text-destructive">
                                      {subField.state.meta.errors.join(", ")}
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </form.Field>
                          </div>

                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="self-start mt-8 md:mt-0 opacity-80 hover:opacity-100"
                            onClick={() => field.removeValue(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }}
          </form.Field>
        </CardContent>
      </Card>
    </div>
  );
}
