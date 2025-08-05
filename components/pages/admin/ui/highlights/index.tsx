"use client";
import { APIStatus } from "@/client/callAPI";
import { updateConfig } from "@/client/configs.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useConfigs } from "@/store/useConfig";
import { HightlightCategoryLayout, LayoutItem } from "@/types/admin-layout";
import { Pencil, Plus, Save, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { v4 } from "uuid";
import EditableBlock from "./editable-item";

export default function AdminLayoutHighLightsBuilder({
  highlightCategories,
}: {
  highlightCategories: HightlightCategoryLayout[];
}) {
  const { toast } = useToast();
  const configs = useConfigs((s) => s.configs);
  const height = configs["CATEGORY_HIGHLIGHTS_PRODUCT_HEIGHT"] as number;

  const [workspaces, setWorkspaces] = useState<HightlightCategoryLayout[]>(
    highlightCategories || []
  );
  const [activeWorkspace, setActiveWorkspace] = useState<string>(
    highlightCategories[0]?.id || ""
  );
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspace);

  const [containerWidth, setContainerWidth] = useState(1200);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLayoutChange = (layout: GridLayout.Layout[]) => {
    setWorkspaces((prev) =>
      prev.map((workspace) => {
        if (workspace.id === activeWorkspace) {
          return {
            ...workspace,
            items: workspace.items.map((item) => {
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
            }),
          };
        }
        return workspace;
      })
    );
  };

  const handleUpdateBlock = (id: string, updates: Partial<LayoutItem>) => {
    setWorkspaces((prev) =>
      prev.map((workspace) => {
        if (workspace.id === activeWorkspace) {
          return {
            ...workspace,
            items: workspace.items.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          };
        }
        return workspace;
      })
    );
  };

  const handleAddBlock = (type: "Banner" | "Product" | "Scrollable") => {
    const workspace = workspaces.find((w) => w.id === activeWorkspace);
    if (!workspace) return;

    // Get all occupied spaces including full width/height
    const occupiedSpaces = new Set();
    workspace.items.forEach((item) => {
      for (let x = item.x; x < item.x + item.w; x++) {
        for (let y = item.y; y < item.y + item.h; y++) {
          occupiedSpaces.add(`${x},${y}`);
        }
      }
    });

    const cols = workspace.cols;
    const width = type === "Banner" ? 2 : 1;
    let newX = 0;
    let newY = 0;
    let found = false;

    // Find first available position that fits the block width
    while (!found) {
      let canPlace = true;
      // Check if all required spaces are free
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

    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === activeWorkspace
          ? {
              ...workspace,
              items: [...workspace.items, newItem],
            }
          : workspace
      )
    );
  };

  const handleAddWorkspace = () => {
    const newId = v4();
    setWorkspaces((prev) => [
      ...prev,
      {
        id: newId,
        name: `Workspace ${workspaces.length + 1}`,
        items: [],
        cols: 5,
      },
    ]);
    setActiveWorkspace(newId);
  };

  const handleWorkspaceNameChange = (id: string, newName: string) => {
    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === id ? { ...workspace, name: newName } : workspace
      )
    );
    setEditingWorkspace(null);
  };

  const handleColumnChange = (workspaceId: string, cols: number) => {
    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === workspaceId ? { ...workspace, cols } : workspace
      )
    );
  };

  const handleHeightChange = (workspaceId: string, height: number) => {
    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === workspaceId ? { ...workspace, height } : workspace
      )
    );
  };

  const handleDeleteWorkspace = (id: string) => {
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    if (activeWorkspace === id) {
      setActiveWorkspace(workspaces.find((w) => w.id !== id)?.id || "");
    }
  };

  const handleSaveWorkspace = async () => {
    const newData = workspaces.map((w) => ({
      ...w,
      items: w.items.map((i) => {
        const { product, products, magazines, ...rest } = i;
        return rest;
      }),
    }));
    const res = await updateConfig(
      "CATEGORY_HIGHLIGHTS",
      JSON.stringify(newData)
    );

    if (!res || res?.status !== APIStatus.OK) {
      return toast({
        description: res.message || "Lỗi khi lưu CATEGORY_HIGHLIGHTS",
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
    <div className="p-3 bg-navy-950">
      <Tabs value={activeWorkspace} onValueChange={setActiveWorkspace}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-white ">
            {workspaces.map((workspace) => (
              <div key={workspace.id} className="relative">
                {editingWorkspace === workspace.id ? (
                  <Input
                    autoFocus
                    defaultValue={workspace.name}
                    className="h-9 w-[120px] bg-transparent"
                    onBlur={(e) =>
                      handleWorkspaceNameChange(workspace.id, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleWorkspaceNameChange(
                          workspace.id,
                          e.currentTarget.value
                        );
                      }
                    }}
                  />
                ) : (
                  <TabsTrigger
                    value={workspace.id}
                    className="group data-[state=active]:bg-primary"
                  >
                    {workspace.name}
                    <div className="ml-2 right-2 hidden group-hover:flex items-center gap-1">
                      <Pencil
                        className="w-3 h-3 opacity-50 hover:opacity-100 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingWorkspace(workspace.id);
                        }}
                      />
                      <Trash
                        className="w-3 h-3  opacity-80 hover:opacity-100 cursor-pointer text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkspace(workspace.id);
                        }}
                      />
                    </div>
                  </TabsTrigger>
                )}
              </div>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-md hover:bg-white/10"
              onClick={handleAddWorkspace}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </TabsList>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Columns</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={currentWorkspace?.cols ?? 6}
                onChange={(e) =>
                  handleColumnChange(activeWorkspace, Number(e.target.value))
                }
                className="w-20"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm">Chiều cao mỗi hàng</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={currentWorkspace?.height || height}
                onChange={(e) =>
                  handleHeightChange(activeWorkspace, Number(e.target.value))
                }
                className="w-20"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddBlock("Banner")}
              >
                <Plus className="w-4 h-4 mr-1" /> Banner
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddBlock("Product")}
              >
                <Plus className="w-4 h-4 mr-1" /> Sản phẩm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddBlock("Scrollable")}
              >
                <Plus className="w-4 h-4 mr-1" /> Vùng cuộn ngang
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
      </Tabs>

      <div
        ref={containerRef}
        className="relative container w-full min-h-[440px] bg-navy-950/80 rounded-lg"
      >
        <GridLayout
          className="layout"
          layout={[
            ...(currentWorkspace?.items.map((item) => ({
              i: item.id,
              x: item.x,
              y: item.y,
              w: item.w,
              h: item.h,
              isResizable: ["Banner", "Scrollable"].includes(item.type),
            })) || []),
          ]}
          cols={currentWorkspace?.cols ?? 6}
          rowHeight={currentWorkspace?.height || height || 380}
          width={containerWidth - 24}
          compactType="vertical"
          preventCollision={false}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          resizeHandles={["se", "sw", "ne", "nw"]}
        >
          {currentWorkspace?.items.map((item) => (
            <div key={item.id}>
              <EditableBlock
                item={item}
                workspaceCols={currentWorkspace?.cols ?? 6}
                containerWidth={containerWidth - 24}
                onUpdate={handleUpdateBlock}
                onDelete={(id) =>
                  setWorkspaces((prev) =>
                    prev.map((workspace) =>
                      workspace.id === activeWorkspace
                        ? {
                            ...workspace,
                            items: workspace.items.filter(
                              (item) => item.id !== id
                            ),
                          }
                        : workspace
                    )
                  )
                }
              />
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
}
