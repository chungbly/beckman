import { deleteFiles } from "@/client/storage.client";
import { useFileManager } from "@/components/file-manager";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getFolderTreeQuery } from "@/query/cloudinary.query";
import { CloudinaryFolderTree } from "@/types/cloudinary";
import { Separator } from "@radix-ui/react-separator";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Folder as FolderIcon,
  FolderOpenIcon,
  FolderPen,
  Link,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { Folder, Tree, useTree } from "../ui/file-tree";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { getParentIds } from "./utils";

const FileTreeSkeleton = () => (
  <div className="w-[200px]  flex-col hidden sm:flex">
    <div className="p-4 px-6 font-semibold">Thư mục</div>
    <div className="flex justify-center">
      <Separator
        orientation="horizontal"
        className="w-3/4 h-[1px] bg-gray-200"
      />
    </div>
    <div className="flex flex-col gap-4 p-2">
      <Skeleton className="w-full h-5" />
      <Skeleton className="w-full h-5" />
      <Skeleton className="w-full h-5" />
      <Skeleton className="w-full h-5" />
      <Skeleton className="w-full h-5" />
      <Skeleton className="w-full h-5" />
      <Skeleton className="w-full h-5" />
    </div>
  </div>
);

const MAX_INITIAL_EXPAND = 5;

const FolderTree = ({ element }: { element: CloudinaryFolderTree }) => {
  const { expandedItems, handleExpand } = useTree();
  const {
    handleOpenFolder,
    handleDrop,
    currentFolderPath,
    handleRename,
    handleGetUrl,
  } = useFileManager();
  const hasChildren = !!element.children?.length;
  const [isRenaming, setIsRenaming] = useState(false);
  const toggleExpand = () => {
    if (!hasChildren) return;
    if (expandedItems?.includes(element.id)) {
      // if (currentFolderPath !== element.path) return;
      handleExpand(element.id);
      return;
    }
    handleExpand(element.id);
  };
  return (
    <Folder
      element={
        <ContextMenu key={element.id}>
          <ContextMenuTrigger>
            <Button
              variant={currentFolderPath === element.id ? "secondary" : "ghost"}
              className="h-auto justify-start gap-1 p-2 w-full"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, element.id)}
              draggable
              onDragStart={(e) =>
                e.dataTransfer.setData("text/plain", element.id)
              }
            >
              {expandedItems?.includes(element.id) ? (
                <ChevronDown
                  onClick={toggleExpand}
                  className={cn("h-4 w-4 invisible", hasChildren && "visible")}
                />
              ) : (
                <ChevronRight
                  onClick={toggleExpand}
                  className={cn("h-4 w-4 invisible", hasChildren && "visible")}
                />
              )}
              <div
                className="flex flex-1 items-center gap-1 w-full"
                onClick={() => {
                  handleOpenFolder(element.path);
                  if (expandedItems?.includes(element.id)) return;
                  toggleExpand();
                }}
              >
                {expandedItems?.includes(element.id) ? (
                  <FolderOpenIcon className="h-5 w-5 text-blue-600" />
                ) : (
                  <FolderIcon className="h-5 w-5 text-blue-600" />
                )}
                {isRenaming ? (
                  <Input
                    autoFocus
                    className="text-sm max-w-[150px] font-medium leading-none overflow-hidden overflow-ellipsis "
                    defaultValue={element.name}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRename(element.id, e.currentTarget.value);
                        setIsRenaming(false);
                      }
                    }}
                    onBlur={() => setIsRenaming(false)}
                  />
                ) : (
                  <div className="text-sm max-w-[150px] font-medium leading-none overflow-hidden overflow-ellipsis ">
                    {element.name}
                  </div>
                )}
              </div>
            </Button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onSelect={() => {
                handleOpenFolder(element.id);
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Xem
            </ContextMenuItem>
            {/* <ContextMenuItem onSelect={() => {}}>
              <Download className="w-4 h-4 mr-2" />
              Tải về
            </ContextMenuItem> */}
            <ContextMenuItem
              onSelect={() => {
                setIsRenaming(true);
              }}
            >
              <FolderPen className="w-4 h-4 mr-2" />
              Đổi tên
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => {
                handleGetUrl(element.id);
              }}
            >
              <Link className="w-4 h-4 mr-2" />
              Copy Link
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={async () => {
                const isDeleted = await deleteFiles([element.id]);
                if (!isDeleted) return;
                handleOpenFolder(currentFolderPath || "root");
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xoá
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      }
      value={element.id}
    >
      {hasChildren &&
        element.children.map((child) => {
          return <FolderTree key={child.id} element={child} />;
        })}
    </Folder>
  );
};

export function FolderSidebar() {
  const { currentFolderPath } = useFileManager();
  const { data: folders, isLoading } = useQuery(getFolderTreeQuery);

  const parentIdsOfCurrentFolder = !!folders
    ? getParentIds(folders, currentFolderPath || "root")
    : [];

  if (isLoading) return <FileTreeSkeleton />;

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    // Get the initial mouse position
    const initialX = e.clientX;

    const initialWidth = sidebar.offsetWidth;

    // Mousemove event to resize the sidebar as the user drags the handle
    const mouseMoveHandler = (e: MouseEvent) => {
      // Calculate the new width based on the mouse movement
      const deltaX = initialX - e.clientX; // Negative deltaX to resize from the left
      const newWidth = initialWidth - deltaX;

      // Set the new width of the sidebar, ensuring it doesn't go below a minimum width (e.g., 100px)
      if (newWidth >= 200) {
        sidebar.style.width = `${newWidth}px`;
      }
    };

    // Mouseup event to stop resizing
    const mouseUpHandler = () => {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };

    // Attach mousemove and mouseup events
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };

  return (
    <div
      id="sidebar"
      className={cn(
        "flex-col hidden sm:flex relative w-[240px] max-h-[calc(100vh-64px)] overflow-scroll"
      )}
    >
      <Separator
        orientation="vertical"
        className="w-[1px] h-full bg-gray-200 absolute right-0 z-10 cursor-col-resize"
        onMouseDown={(e) => onMouseDown(e)}
      />
      <div className="p-4 px-6 font-semibold">Thư mục</div>
      <div className="flex justify-center">
        <Separator
          orientation="horizontal"
          className="w-3/4 h-[1px] bg-gray-200"
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 pt-2">
          {!folders?.length ? (
            <div>Không có thư mục</div>
          ) : (
            <Tree
              className="overflow-hidden rounded-md bg-background"
              initialExpandedItems={folders
                .filter(
                  (f, index) => f.children?.length && index < MAX_INITIAL_EXPAND
                )
                .map((f) => f.id)
                .concat(parentIdsOfCurrentFolder)}
              elements={folders}
            >
              {folders.map((element) => {
                return <FolderTree key={element.id} element={element} />;
              })}
            </Tree>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
