"use client";
import FileManagerDialog from "@/components/file-manager/file-manager-dialog";
import PostItem from "@/components/pages/client/home-page/hightlight-category/post-item";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutItem } from "@/types/admin-layout";
import { Grip, ImagePlus, MousePointerClick, Trash } from "lucide-react";
import Image from "next/image";
import { forwardRef, Ref } from "react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import EditableItemProperties from "../highlights/item-properties-dialog";

const EditableBlock = forwardRef(
  (
    {
      item,
      onUpdate,
      onDelete,
      style,
      className,
      onMouseDown,
      onMouseUp,
      onTouchEnd,
    }: {
      item: LayoutItem;
      onUpdate: (id: string, updates: Partial<LayoutItem>) => void;
      onDelete: (id: string) => void;
      style?: React.CSSProperties;
      className?: string;
      onMouseDown?: React.MouseEventHandler<SVGSVGElement>;
      onMouseUp?: React.MouseEventHandler<SVGSVGElement>;
      onTouchEnd?: React.TouchEventHandler<SVGSVGElement>;
      containerWidth: number;
      workspaceCols: number;
    },
    ref: Ref<HTMLDivElement | null>
  ) => {
    return (
      <div
        style={{ ...style }}
        ref={ref}
        className={cn("h-full bg-white rounded-lg group/block", className)}
      >
        <Button
          size="icon"
          className="absolute top-2 left-2 z-10 cursor-move drag-handle"
        >
          <Grip
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
          />
        </Button>

        <EditableItemProperties item={item} onUpdate={onUpdate} />

        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 z-10 hidden group-hover/block:flex"
          onClick={() => onDelete(item.id)}
        >
          <Trash size={16} />
        </Button>

        {item.type === "Banner" && (
          <FileManagerDialog
            singleSelect
            onSelect={(image) => onUpdate(item.id, { image: image })}
          >
            {item.image ? (
              <div className="absolute inset-0 group flex flex-col gap-2">
                <div className="relative flex-1">
                  <Image
                    src={item.image}
                    alt="banner"
                    fill
                    className={cn("object-fit rounded")}
                  />
                  <span className="hidden cursor-pointer group-hover:flex gap-2 items-center z-10 bg-white/80 rounded-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <MousePointerClick />
                  </span>
                </div>
              </div>
            ) : (
              <div className="absolute cursor-pointer inset-0 flex items-center justify-center">
                <ImagePlus className="h-6 w-6" />
              </div>
            )}
          </FileManagerDialog>
        )}

        {item.type === "Product" && item.product && (
          <div className="absolute inset-0 group/product flex items-center justify-center">
            <ProductCard className="absolute inset-0" product={item.product} />
          </div>
        )}
        {item.type === "Scrollable" &&
          item.slideType === "Product" &&
          !!item.products?.length && (
            <div
              className={cn("w-full h-full flex gap-4 overflow-x-auto")}
            >
              {item.products.map((product) => (
                <div
                  key={product._id}
                  style={{
                    minWidth: `calc((100% - 4rem) / ${item.w})`,
                    width: `calc((100% - 4rem) / ${item.w})`,
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        {item.type === "Scrollable" &&
          item.slideType === "Magazine" &&
          !!item.magazines?.length && (
            <div className={cn("w-full flex gap-4 overflow-x-auto pb-2")}>
              {item.magazines.map((post) => (
                <div
                  key={post._id}
                  style={{
                    minWidth: `calc((100% - 4rem) / ${item.w / 2})`,
                    width: `calc((100% - 4rem) / ${item.w / 2})`,
                  }}
                >
                  <PostItem post={post} />
                </div>
              ))}
            </div>
          )}
      </div>
    );
  }
);

EditableBlock.displayName = "EditableBlock";
export default EditableBlock;
