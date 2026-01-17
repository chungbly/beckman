import { APIStatus } from "@/client/callAPI";
import {
  checkNameExists,
  copyFiles,
  moveFiles,
  uploadFile,
} from "@/client/cloudinary.client";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  getFileInFolderQuery,
  getSubFoldersQuery,
} from "@/query/cloudinary.query";
import { CloudinaryFile } from "@/types/cloudinary";
import { bytesToSize } from "@/utils";
import { IconFile } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardPaste,
  FileUp,
  Folder,
  FolderPlus,
  VideoIcon,
} from "lucide-react";
import moment from "moment";
import dynamic from "next/dynamic";
import Image from "next/image";
import { DragEvent, useRef } from "react";
import { useFileManager } from ".";
import { TooltipWrap } from "../ui/tooltip";
const RightMenu = dynamic(() => import("./file-right-menu"));

export const getFileIcon = (file: CloudinaryFile) => {
  switch (file.resource_type) {
    case "image":
      return (
        <Image
          src={file.url}
          fill
          sizes="(min-width: 1024px) 200px, 100px"
          alt={file.display_name}
          className="object-cover rounded-sm"
        />
      );
    case "video":
      return (
        <div className="absolute top-0 left-0 w-full h-full">
          <video
            src={file.url}
            className="object-cover rounded-sm absolute top-0 left-0 w-full h-full"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-2 text-white">
            <VideoIcon />
          </div>
        </div>
      );
    default:
      return <IconFile className="h-8 w-8 text-blue-500" />;
  }
};

export default function FileGrid() {
  const {
    handleOpenFolder,
    handleDrop,
    form,
    currentFolderPath,
    singleSelect,
  } = useFileManager();
  const queryClient = useQueryClient();
  const { data: files, isLoading } = useQuery(
    getFileInFolderQuery(currentFolderPath || "")
  );

  const { data: folders, isLoading: isLoadingFolders } = useQuery(
    getSubFoldersQuery(currentFolderPath || "")
  );

  const { toast } = useToast();
  const draggingTypeRef = useRef<"file" | "folder" | null>(null);
  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger>
        {isLoading ||
        isLoadingFolders ||
        (!files?.length && !folders?.length) ? (
          isLoading || isLoadingFolders ? (
            <div className="w-full h-[75vh] flex flex-col items-center justify-center gap-4 p-4">
              <Folder className="h-16 w-16 text-gray-300" />
              <div className="text-gray-500">Đang tải...</div>
            </div>
          ) : (
            <div className="w-full h-[75vh] flex flex-col items-center justify-center gap-4 p-4">
              <Folder className="h-16 w-16 text-gray-300" />
              <div className="text-gray-500">Không có tệp nào</div>
            </div>
          )
        ) : (
          <form.Subscribe
            selector={(state) => ({
              search: state.values.search,
            })}
            children={({ search }) => {
              const filteredFiles = files?.length
                ? files.filter((f) =>
                    f.display_name
                      ?.toLowerCase()
                      .includes(search?.toLowerCase())
                  )
                : [];
              const filteredFolders = folders?.length
                ? folders.filter((f) =>
                    f.name?.toLowerCase().includes(search?.toLowerCase())
                  )
                : [];
              return !filteredFiles.length && !filteredFolders ? (
                <div className="w-full h-[75vh] flex flex-col items-center justify-center gap-4 p-4">
                  <Folder className="h-16 w-16 text-gray-300" />
                  <div className="text-gray-500">Không có tệp nào</div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 h-[78vh] max-h-[78vh] overflow-scroll">
                  <p className="font-semibold text-neutral-400">Thư mục</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    {filteredFolders.map((folder) => (
                      <ContextMenu modal={false} key={folder.id}>
                        <ContextMenuTrigger>
                          <button
                            className="group w-full flex gap-4 items-center relative rounded-lg border h-full p-3 hover:bg-accent"
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", folder.id);
                              e.dataTransfer.setData("type", "folder");
                              draggingTypeRef.current = "folder";
                            }}
                            onDragEnd={() => {
                              draggingTypeRef.current = null;
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onDrop={(e) => {
                              e.stopPropagation();
                              handleDrop(
                                e as unknown as DragEvent<HTMLButtonElement>,
                                folder.id
                              );
                            }}
                            onDoubleClick={() => handleOpenFolder(folder.path)}
                          >
                            <Folder className="h-8 w-8 col-span-1 text-rose-500" />
                            <span className="font-medium overflow-ellipsis line-clamp-1">
                              {folder.name}
                            </span>
                          </button>
                          <RightMenu folder={folder} />
                        </ContextMenuTrigger>
                      </ContextMenu>
                    ))}
                  </div>
                  <p className="font-semibold text-neutral-400">Tệp</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                    {filteredFiles.map((file, index) => (
                      <ContextMenu modal={false} key={file._id}>
                        <ContextMenuTrigger>
                          <form.Field
                            name="selectedFiles"
                            children={(field) => (
                              <div
                                className={cn(
                                  "group relative rounded-lg border bg-accent-foreground/[0.01] h-full p-1 hover:border-primary",
                                  "drag-over-file"
                                )}
                                onClick={() => {
                                  field.handleChange(
                                    field.state.value.includes(file)
                                      ? field.state.value.filter(
                                          (url) => url !== file
                                        )
                                      : [...field.state.value, file]
                                  );

                                  if (singleSelect) {
                                    form.handleSubmit();
                                  }
                                }}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData("text/plain", file._id);
                                  e.dataTransfer.setData("type", "file");
                                  draggingTypeRef.current = "file";
                                  
                                  // Tạo drag image từ element hiện tại
                                  const dragElement = e.currentTarget.cloneNode(true) as HTMLElement;
                                  dragElement.style.width = `${e.currentTarget.offsetWidth}px`;
                                  dragElement.style.opacity = "0.8";
                                  dragElement.style.position = "absolute";
                                  dragElement.style.top = "-9999px";
                                  dragElement.style.pointerEvents = "none";
                                  dragElement.style.transform = "scale(0.9)";
                                  dragElement.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.3)";
                                  document.body.appendChild(dragElement);
                                  
                                  // Set drag image
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  e.dataTransfer.setDragImage(
                                    dragElement,
                                    rect.width / 2,
                                    rect.height / 2
                                  );
                                  
                                  // Xóa element sau khi drag bắt đầu
                                  setTimeout(() => {
                                    if (document.body.contains(dragElement)) {
                                      document.body.removeChild(dragElement);
                                    }
                                  }, 0);
                                }}
                                onDragEnd={() => {
                                  draggingTypeRef.current = null;
                                }}
                                onDragOver={(e) => {
                                  // Nếu đang drag file, không cho phép drop lên file khác
                                  if (draggingTypeRef.current === "file") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.dataTransfer.dropEffect = "none";
                                    e.currentTarget.style.cursor = "not-allowed";
                                    return;
                                  }
                                  
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onDragLeave={(e) => {
                                  e.currentTarget.style.cursor = "";
                                }}
                                onDrop={(e) => {
                                  // Chặn drop file lên file khác
                                  if (draggingTypeRef.current === "file") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.currentTarget.style.cursor = "";
                                    return;
                                  }
                                  
                                  e.stopPropagation();
                                  handleDrop(
                                    e as unknown as DragEvent<HTMLButtonElement>,
                                    file.asset_id
                                  );
                                  e.currentTarget.style.cursor = "";
                                }}
                                onDoubleClick={() =>
                                  form.setFieldValue(
                                    "imageToViewUrl",
                                    file.secure_url
                                  )
                                }
                              >
                                <div
                                  className={cn(
                                    "absolute z-10 right-2 top-2 flex items-center gap-2 group-hover:opacity-100",
                                    field.state.value.some(
                                      (c) => c._id === file._id
                                    )
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                >
                                  <Checkbox
                                    checked={field.state.value.some(
                                      (c) => c._id === file._id
                                    )}
                                    className="bg-white/50 backdrop-blur-sm"
                                  />
                                </div>

                                <div className="flex relative aspect-[4/3] max-w-full max-h-full items-center justify-center rounded-lg">
                                  {getFileIcon(file)}
                                </div>
                                <TooltipWrap
                                  content={file.filename}
                                  side="bottom"
                                >
                                  <div className="mt-3 flex flex-col gap-1 text-sm font-medium">
                                    <span className="overflow-ellipsis overflow-hidden line-clamp-2 font-medium text-sm">
                                      {file.display_name}
                                    </span>
                                    <span className="text-neutral-600 text-xs">
                                      {bytesToSize(file.bytes)}
                                    </span>
                                    <span className="text-neutral-600 text-xs">
                                      Ngày tạo:{" "}
                                      {moment(file.created_at).format(
                                        "DD-MM-YYYY"
                                      )}
                                    </span>
                                  </div>
                                </TooltipWrap>
                              </div>
                            )}
                          />
                        </ContextMenuTrigger>
                        <RightMenu file={file} />
                      </ContextMenu>
                    ))}
                  </div>
                </div>
              );
            }}
          />
        )}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onSelect={() => form.setFieldValue("isCreatingFolder", true)}
        >
          <FolderPlus className="w-4 h-4 mr-2" />
          Thư mục mới
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.accept = "image/*,video/*";
            input.click();
            input.addEventListener("change", async (e) => {
              const files = (e.target as HTMLInputElement).files;
              if (!files) return;
              const names = Array.from(files).map((f) => f.name);
              const checkNameRes = await checkNameExists(
                names,
                currentFolderPath
              );
              if (checkNameRes.data?.length) {
                return toast({
                  title: "Upload thất bại",
                  description: `Tên tệp ${checkNameRes.data.join(
                    ", "
                  )} đã tồn tại`,
                  variant: "warning",
                });
              }
              form.setFieldValue("uploadingStatus", "uploading");
              form.setFieldValue("uploadingFiles", files);
              const res = await uploadFile(files, currentFolderPath);
              if (res?.status === APIStatus.OK) {
                form.setFieldValue("uploadingStatus", "completed");
                queryClient.invalidateQueries({
                  queryKey: ["cloudinary-folder-files", currentFolderPath],
                });
                setTimeout(() => {
                  form.setFieldValue("uploadingStatus", null);
                  form.setFieldValue("uploadingFiles", null);
                }, 60000);
              } else {
                form.setFieldValue("uploadingStatus", "error");
                toast({
                  title: "Tải lên thất bại",
                  description: res?.message,
                  variant: "error",
                });
              }
            });
          }}
        >
          <FileUp className="w-4 h-4 mr-2" />
          Tải tệp lên
        </ContextMenuItem>
        <form.Subscribe
          selector={(state) => [
            state.values.copyFileIds,
            state.values.moveFileIds,
          ]}
          children={([copyFileIds, moveFileIds]) =>
            copyFileIds?.length || moveFileIds?.length ? (
              <ContextMenuItem
                onSelect={async () => {
                  if (copyFileIds?.length) {
                    const res = await copyFiles(copyFileIds, {
                      folderPath: currentFolderPath,
                    });
                    if (res.status === APIStatus.OK) {
                      form.setFieldValue("copyFileIds", []);
                      const sourceFolderPath = files?.find((f) =>
                        copyFileIds.includes(f.asset_id)
                      )?.asset_folder;
                      queryClient.invalidateQueries({
                        queryKey: [
                          "cloudinary-folder-files",
                          currentFolderPath,
                        ],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["cloudinary-folder-files", sourceFolderPath],
                      });
                    }
                    return;
                  }
                  if (moveFileIds?.length) {
                    const res = await moveFiles(moveFileIds, {
                      folderPath: currentFolderPath,
                    });
                    if (res?.status === APIStatus.OK) {
                      form.setFieldValue("moveFileIds", []);
                      const sourceFolderPath = files?.find((f) =>
                        moveFileIds.includes(f.asset_id)
                      )?.asset_folder;
                      queryClient.invalidateQueries({
                        queryKey: [
                          "cloudinary-folder-files",
                          currentFolderPath,
                        ],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["cloudinary-folder-files", sourceFolderPath],
                      });
                    }
                  }
                }}
              >
                <ClipboardPaste className="w-4 h-4 mr-2" />
                Paste
              </ContextMenuItem>
            ) : null
          }
        />
      </ContextMenuContent>
    </ContextMenu>
  );
}
