"use client";
import { APIStatus } from "@/client/callAPI";
import { updateConfig } from "@/client/configs.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LayoutItem, SubMenuLayout } from "@/types/admin-layout";
import { Plus, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { v4 } from "uuid";
import EditableBlock from "../highlights/editable-item";

export default function AdminLayoutSubMenuBuilder({
  submenu,
}: {
  submenu: SubMenuLayout;
}) {
  const { toast } = useToast();
  const [containerWidth, setContainerWidth] = useState(1200);
  const [cols, setCols] = useState(submenu?.cols || 6);
  const [height, setHeight] = useState(submenu?.height || 140);
  const [items, setItems] = useState<LayoutItem[]>(submenu?.items || []);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLayoutChange = (layout: GridLayout.Layout[]) => {
    setItems((prev) =>
      prev.map((item) => {
        const layoutItem = layout.find((l) => l.i === item.id);
        if (layoutItem) {
          return {
            ...item,
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          };
        }
        return item;
      })
    );
  };

  const handleUpdateBlock = (id: string, updates: Partial<LayoutItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleAddBlock = (type: "Banner" | "Product" | "Scrollable") => {
    const occupiedSpaces = new Set();
    items.forEach((item) => {
      for (let x = item.x; x < item.x + item.w; x++) {
        for (let y = item.y; y < item.y + item.h; y++) {
          occupiedSpaces.add(`${x},${y}`);
        }
      }
    });

    const width = 1;
    let newX = 0;
    let newY = 0;
    let found = false;

    while (!found) {
      let canPlace = true;
      for (let x = newX; x < newX + width; x++) {
        if (x >= cols || occupiedSpaces.has(`${x},${newY}`)) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        found = true;
      } else {
        newX++;
        if (newX + width > cols) {
          newX = 0;
          newY++;
        }
      }
    }

    const newItem: LayoutItem = {
      id: v4(),
      type,
      x: newX,
      y: newY,
      w: width,
      h: 1,
      isDesktop: true,
      isMobile: true,
      ...(type === "Scrollable" ? { slideType: "Product" } : {}),
    };

    setItems((prev) => [...prev, newItem]);
  };

  const handleSaveWorkspace = async () => {
    const newData = items.map((item) => {
      const { product, products, magazines, ...rest } = item;
      return rest;
    });

    const res = await updateConfig(
      "SUB_MENU_HOME_PAGE",
      JSON.stringify({ id: "default", cols, items: newData, height })
    );

    if (!res || res?.status !== APIStatus.OK) {
      return toast({
        description: res.message || "Lỗi khi lưu SUB_MENU_HOME_PAGE",
        variant: "error",
      });
    }
    toast({
      description: "Lưu thành công",
      variant: "success",
    });
  };

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div className="p-3 bg-navy-950" ref={containerRef}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Columns</Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="w-20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Chiều cao mỗi hàng</Label>
            <Input
              type="number"
              min={0}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-20"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddBlock("Banner")}
            >
              <Plus className="w-4 h-4 mr-1" /> Ảnh
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-emerald-500 text-primary"
              onClick={handleSaveWorkspace}
            >
              <Save className="text-primary mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="relative min-h-[440px] bg-navy-950/80 rounded-lg">
        <GridLayout
          className="layout"
          layout={items.map((item) => ({
            i: item.id,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            isResizable: ["Banner", "Scrollable"].includes(item.type),
          }))}
          cols={cols}
          rowHeight={height}
          width={containerWidth - 24}
          compactType="vertical"
          preventCollision={false}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          resizeHandles={["se", "sw", "ne", "nw"]}
        >
          {items.map((item) => (
            <div key={item.id}>
              <EditableBlock
                item={item}
                workspaceCols={cols}
                containerWidth={containerWidth - 24}
                onUpdate={handleUpdateBlock}
                onDelete={(id) =>
                  setItems((prev) => prev.filter((item) => item.id !== id))
                }
              />
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
}
