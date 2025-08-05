//@ts-nocheck
import { deleteCategory, updateCategoryStatus } from "@/client/category.client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAlert } from "@/store/useAlert";
import { useForm } from "@tanstack/react-form";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { CategoryTree } from "./container";

import {
  SimpleTreeItemWrapper,
  TreeItemComponentProps,
} from "dnd-kit-sortable-tree";
import { forwardRef } from "react";

export const TreeItem = forwardRef<
  HTMLDivElement,
  TreeItemComponentProps<CategoryTree>
>((props, ref) => {
  const category = props.item;
  const parent = props.parent;

  const { toast } = useToast();
  const { setAlert, closeAlert } = useAlert();
  const form = useForm({
    defaultValues: {
      category,
    },
  });

  const handleChangeStatus = async (status: "active" | "inactive") => {
    setAlert({
      title: "Cập nhật trạng thái",
      description: `Bạn có chắc chắn muốn ${
        status === "active" ? "hiển thị" : "ẩn"
      } danh mục này không?`,
      onSubmit: async () => {
        form.setFieldValue("category.isShow", status === "active");
        const res = await updateCategoryStatus(
          [category.id!],
          status === "active"
        );
        if (res.status === "OK") {
          toast({
            title: "Cập nhật trạng thái thành công",
          });
        } else {
          toast({
            title: "Cập nhật trạng thái thất bại",
            description: res.message,
            variant: "error",
          });
        }
        closeAlert();
      },
    });
  };

  if (parent?.collapsed) return null;
  return (
    <div
      key={category.id}
      className="hover:bg-gray-50 grid grid-cols-[1fr,200px,200px] gap-4 items-center py-2 border-b"
    >
      <div>
        <SimpleTreeItemWrapper
          {...props}
          ref={ref}
          className="[&>div]:border-0 cursor-move"
        >
          <p className="text-sm text-foreground">{category.name}</p>
        </SimpleTreeItemWrapper>
      </div>
      {/* @ts-ignore */}
      <form.Field
        name="category"
        children={(field) => {
          const category = field.state.value;
          if (category.id === "1") return null;
          return (
            <>
              <div>
                <Select
                  value={category.isShow ? "active" : "inactive"}
                  onValueChange={(v) => {
                    handleChangeStatus(v as "active" | "inactive");
                  }}
                >
                  <SelectTrigger className="w-fit sm:w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <span className="flex items-center gap-2 w-fit">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="hidden sm:block">Active</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <span className="flex items-center gap-2 w-fit">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="hidden sm:block">Inactive</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Link href={`/admin/categories/${field.state.value.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-primary"
                  >
                    <Pencil className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline-block">Edit</span>
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 min-w-8 ml-2"
                  onClick={() => {
                    setAlert({
                      title: "Xóa danh mục",
                      variant: "destructive",
                      description: `Bạn có chắc chắn muốn xóa danh mục này không?`,
                      onSubmit: async () => {
                        const res = await deleteCategory([category.id]);
                        if (res.status === "OK") {
                          toast({
                            title: "Xóa danh mục thành công",
                          });
                        } else {
                          toast({
                            title: "Xóa danh mục thất bại",
                            description: res.message,
                            variant: "error",
                          });
                        }
                        closeAlert();
                      },
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </>
          );
        }}
      />
    </div>
  );
});

TreeItem.displayName = "TreeItem";
