"use client";

import { APIStatus } from "@/client/callAPI";
import { updateCategoryOrderBulk } from "@/client/category.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCategoryQuery } from "@/query/category.query";
import { useAlert } from "@/store/useAlert";
import { Category } from "@/types/category";
import { isNil } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { SortableTree } from "dnd-kit-sortable-tree";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TreeItem } from "./category-item";
import CategorySkeleton from "./loading";
import { getChildCategories } from "./page";



export type CategoryTree = {
  id: string;
  name: string;
  groupName: string;
  isShow: boolean;
  parentId?: string | null;
  slug?: string;
  children: CategoryTree[];
  index?: number;
  mobileBanner?: string;
};

export default function ProductCategories() {
  const [isMounted, setIsMounted] = useState(false);
  const { setAlert, closeAlert } = useAlert();
  const { toast } = useToast();
  const { data, isLoading } = useQuery(getCategoryQuery);

  const [categories, setCategories] = useState<CategoryTree[]>([]);

  const getDepth = (categories: CategoryTree[], id: string): number => {
    const findDepth = (
      cats: CategoryTree[],
      searchId: string,
      currentDepth: number = 0
    ): number => {
      for (const cat of cats) {
        if (cat.id === searchId) return currentDepth;
        const childDepth = findDepth(
          cat.children || [],
          searchId,
          currentDepth + 1
        );
        if (childDepth !== -1) return childDepth;
      }
      return -1;
    };
    return findDepth(categories, id);
  };

  const findCategoryById = (
    categories: CategoryTree[],
    id: string
  ): CategoryTree | null => {
    if (!categories) return null;
    for (const category of categories) {
      if (category.id === id) return category;
      if (!category.children) continue;
      const found = findCategoryById(category.children, id);
      if (found) return found;
    }
    return null;
  };

  const findParentCategory = (
    categories: CategoryTree[],
    id: string
  ): CategoryTree | null => {
    for (const category of categories) {
      if (!category.children) continue;
      if (category.children.some((child) => child.id === id)) return category;
      const found = findParentCategory(category.children, id);
      if (found) return found;
    }
    return null;
  };

  const getFlatCategories = (categories: CategoryTree[]): CategoryTree[] => {
    let result: CategoryTree[] = [];
    for (const category of categories) {
      result.push(category);
      if (category.children) {
        result = [...result, ...getFlatCategories(category.children)];
      }
    }
    return result;
  };

  useEffect(() => {
    if (!isMounted) setIsMounted(true);
    if (data) {
      const originalCategories = (
        JSON.parse(JSON.stringify(data)) as Category[]
      )
        .filter((c) => !c.parentId)
        .sort((a, b) => (a.index || 999) - (b.index || 999))
        .map((category) => {
          return {
            ...category,
            id: category._id,
            children: (
              getChildCategories(
                data as unknown as CategoryTree[],
                category._id
              ) ?? []
            ).sort((a, b) => (a.index || 999) - (b.index || 999)),
          };
        }) as CategoryTree[];
      setCategories(originalCategories);
    }
  }, [data]);

  if (isLoading || !isMounted) return <CategorySkeleton />;

  return (
    <div className="p-2 sm:p-6">
      <PageBreadCrumb breadcrumbs={[{ name: "Danh mục sản phẩm" }]} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Danh mục</h1>
        <div className="flex gap-2">
          <Link href="/admin/categories/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Danh mục mới
            </Button>
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-[1fr,200px,200px,200px] gap-4 border-b font-medium text-sm py-4">
          <div className="pl-4">Tên</div>
          <div >Tên nhóm</div>
          <div>Trạng thái</div>
          <div className="pr-4">Hành động</div>
        </div>

        <div>
          <SortableTree
            items={categories}
            onItemsChanged={(items, reason) => {
              const { type } = reason;
              if (type === "collapsed" || type === "expanded") {
                setCategories(items);
                return;
              }
              if (type === "removed") {
                setCategories(items);
                return;
              }
              if (type === "dropped") {
                const { draggedFromParent, draggedItem, droppedToParent } =
                  reason;
                let description = "";
                const parent = draggedItem?.parentId
                  ? findCategoryById(items, draggedItem.parentId)
                  : null;
                let newIndex = draggedItem?.parentId
                  ? parent?.children.findIndex((c) => c.id === draggedItem.id)
                  : items.findIndex((c) => c.id === draggedItem.id);

                newIndex = !isNil(newIndex)
                  ? (newIndex || 0) + 1
                  : draggedItem.parentId
                  ? parent?.children.length
                  : items.length;

                const isReOrder =
                  draggedFromParent?.id === droppedToParent?.id ||
                  (!draggedFromParent && !droppedToParent);
                // const isMoveToNewParent =
                if (isReOrder) {
                  description = `Danh mục ${
                    draggedItem.name
                  } sẽ được di chuyển đến vị trí ${newIndex} trong danh mục ${
                    findParentCategory(items, draggedItem.id)?.name ?? "root"
                  } , Bạn có chắc chắn không?`;
                }
                if (draggedFromParent?.id !== droppedToParent?.id) {
                  description = `Danh mục ${
                    draggedItem.name
                  } sẽ được di chuyển vào ${
                    droppedToParent?.name ?? "root"
                  }, Bạn có chắc chắn không?`;
                }
                const newCategories = getFlatCategories(items);
                const categoriesNeedUpdate = newCategories.map((c) => {
                  const parent = findParentCategory(items, c.id);
                  const children = parent?.children || items;
                  const index = children.findIndex(
                    (child) => child.id === c.id
                  );
                  return {
                    id: c.id,
                    index: index !== -1 ? index + 1 : children.length,
                    parentId: parent?.id,
                  };
                });
                setAlert({
                  title: "Cập nhật danh mục",
                  description,
                  variant: "success",
                  onSubmit: async () => {
                    const res = await updateCategoryOrderBulk(
                      categoriesNeedUpdate
                    );
                    if (res.status === APIStatus.OK) {
                      setCategories(items);
                      toast({
                        title: "Cập nhật thành công",
                      });
                      closeAlert();
                    } else {
                      toast({
                        title: "Có lỗi xảy ra",
                        description: res.message,
                        variant: "error",
                      });
                    }
                  },
                });
              }
            }}
            TreeItemComponent={TreeItem}
          />
          {!categories?.length && (
            <div className="text-center py-8 text-muted-foreground">
              Không có danh mục nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
