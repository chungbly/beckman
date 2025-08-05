"use client";
import { getPosts } from "@/client/post.client";
import { getProduct, getProducts } from "@/client/product.client";
import PostSelector from "@/components/selectors/post-selector";
import ProductSelector, {
  ArrayChipProduct,
} from "@/components/selectors/product-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutItem, SlideType } from "@/types/admin-layout";
import { Product } from "@/types/product";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Newspaper, Settings, Shirt, X } from "lucide-react";
function EditableItemProperties({
  item,
  onUpdate,
}: {
  item: LayoutItem;
  onUpdate: (id: string, data: Partial<LayoutItem>) => void;
}) {
  const handleChangeProduct = async (productId: number) => {
    if (item.product && productId === item.product?.kvId) {
      return;
    }
    const res = await getProduct(productId!);
    const product = res?.data || undefined;
    onUpdate(item.id, {
      productId,
      product,
    });
  };
  const handleChangeProductList = async (productIds: number[]) => {
    if (item.productIds && productIds.length === item.productIds.length) {
      return;
    }
    const res = await getProducts(
      {
        ids: productIds,
        status: true,
      },
      productIds.length
    );
    const products: Product[] = [];
    // giữ cho mảng products đúng thứ tự
    productIds.forEach((id) => {
      const prd = (res?.data || []).find((p) => p.kvId === id);
      if (prd) {
        products.push(prd);
      }
    });
    onUpdate(item.id, {
      productIds,
      products,
    });
  };

  const handleChangeMagazineList = async (magazineIds: string[]) => {
    if (item.magazineIds && magazineIds.length === item.magazineIds.length) {
      return;
    }
    const res = await getPosts(
      {
        ids: magazineIds,
        isShow: true,
      },
      magazineIds.length
    );
    const magazines = res?.data || undefined;
    onUpdate(item.id, {
      magazineIds,
      magazines,
    });
  };
  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-16 z-10 hidden group-hover/block:flex"
        >
          <Settings size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Thiết lập thuộc tính</DialogTitle>

        {item.type === "Product" && (
          <div className="flex flex-col space-y-1 items-start p-1 justify-center h-full">
            <span className="text-sm text-gray-600">Chọn sản phẩm </span>
            <ProductSelector
              value={item.productId}
              multiple={false}
              onChange={handleChangeProduct}
            />
          </div>
        )}
        {item.type === "Scrollable" && (
          <div className="flex flex-col space-y-1 items-start p-1 justify-center h-full">
            <span className="text-sm text-gray-600">Chọn loại vùng</span>
            <ToggleGroup
              type="single"
              value={item.slideType}
              onValueChange={(type) =>
                onUpdate(item.id, { slideType: type as SlideType })
              }
            >
              <ToggleGroupItem value="Product" aria-label="Toggle italic">
                <Shirt className="h-4 w-4" />
                Sản phẩm
              </ToggleGroupItem>
              <ToggleGroupItem value="Magazine">
                <Newspaper className="h-4 w-4" />
                Magazine
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
        {item.type === "Scrollable" && item.slideType === "Product" && (
          <div className="flex flex-col space-y-1 items-start justify-center h-full max-w-full">
            <span className="text-sm text-gray-600">
              Chọn danh sách sản phẩm{" "}
            </span>
            <ProductSelector
              value={item.productIds}
              multiple
              className="max-w-md"
              onChange={handleChangeProductList}
            />
            <ArrayChipProduct
              prdIds={item.productIds || []}
              onDelete={(id) =>
                handleChangeProductList(
                  item.productIds?.filter((_id) => _id !== id) || []
                )
              }
            />
          </div>
        )}

        {item.type === "Scrollable" && item.slideType === "Magazine" && (
          <div className="flex flex-col space-y-1 items-start justify-center h-full max-w-full">
            <span className="text-sm text-gray-600">
              Chọn danh sách bài viết
            </span>
            <PostSelector
              value={item.magazineIds}
              multiple
              className="max-w-md"
              onChange={handleChangeMagazineList}
            />
            {item.magazines?.map((magazine) => (
              <div key={magazine._id} className="flex items-center space-x-2">
                <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                  {magazine.title}
                  <X
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => {
                      handleChangeMagazineList(
                        item.magazineIds?.filter(
                          (_id) => _id !== magazine._id
                        ) || []
                      );
                    }}
                  />
                </Badge>
              </div>
            ))}
          </div>
        )}

        <Input
          id={`url-${item.id}`}
          className="max-w-md"
          placeholder="Url chuyển hướng"
          defaultValue={item.href || ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onUpdate(item.id, {
                href: (e.target as HTMLInputElement).value,
              });
            }
          }}
        />
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDesktop"
              defaultChecked={item.isDesktop}
              onCheckedChange={(checked) =>
                onUpdate(item.id, { isDesktop: checked as boolean })
              }
            />
            <label
              htmlFor="isDesktop"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Desktop
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isMobile"
              defaultChecked={item.isMobile}
              onCheckedChange={(checked) =>
                onUpdate(item.id, { isMobile: checked as boolean })
              }
            />
            <label
              htmlFor="isDesktop"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mobile
            </label>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              size="sm"
              onClick={() => {
                const input = document.getElementById(
                  `url-${item.id}`
                ) as HTMLInputElement;
                const value = input.value;
                onUpdate(item.id, {
                  href: value,
                });
              }}
            >
              OK
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditableItemProperties;
