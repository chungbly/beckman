"use client";

import { APIStatus } from "@/client/callAPI";
import { createFolder, moveFiles } from "@/client/cloudinary.client";
import { getFileLinks, renameFile } from "@/client/storage.client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { setCurrentFolderPath as setCurrentFolderPathCookie } from "@/lib/cookies";
import { cn } from "@/lib/utils";
import {
  FileManagerContextProps,
  FileManagerData,
} from "@/types/drive-storage";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlignJustify,
  Check,
  Files,
  Grid2x2,
  Scissors,
  Trash2,
  X,
} from "lucide-react";
import { createContext, Fragment, useContext, useState } from "react";
import PageBreadCrumb from "../app-layout/page-breadcrumb";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { TooltipWrap } from "../ui/tooltip";
import ConfirmDeleteDialog from "./confirm-delete-dialog";
import ConfirmDeleteFolderDialog from "./confirm-delete-folder-dialog";
import { CreateFolderDialog } from "./create-folder-dialog";
import FileGrid from "./file-grid";
import FileUploadList from "./file-upload-list";
import { FolderSidebar } from "./folder-sidebar";
import ImageViewer from "./images-viewer";
import RenameDialog from "./rename-file-dialog";
import RenameFolderDialog from "./rename-folder-dialog";

const FileManagerContext = createContext<FileManagerContextProps | null>(null);

export const useFileManager = (): FileManagerContextProps => {
  const context = useContext(FileManagerContext);
  if (!context) {
    throw new Error("useFileManager must be used within a FileManagerProvider");
  }
  return context;
};

export default function FileManager({
  onSelect,
  singleSelect,
  currentFolderPath: currentFolderPathDefault = "",
}: {
  onSelect?: (images: string[]) => void;
  singleSelect?: boolean;
  currentFolderPath?: string;
}) {
  const [currentFolderPath, setCurrentFolderPath] = useState<string>(
    currentFolderPathDefault
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FileManagerData>({
    onSubmit: async ({ value }) => {
      const selectedFileUlrs = value?.selectedFiles?.map((f) => f.url);
      onSelect?.(selectedFileUlrs || []);
    },
    defaultValues: {
      imageToViewUrl: "",
      selectedFiles: [],
      selectedFileId: "",
      deleteFileIds: [],
      deleteFolderIds: [],
      renameFolderId: "",
      copyFileIds: [],
      moveFileIds: [],
      isCreatingFolder: false,
      uploadingFiles: null,
      uploadingStatus: null,
      layout: "grid",
      search: "",
    },
  });

  const breadcrumbPaths = currentFolderPath.split("/").reduce((acc, cur) => {
    return [...acc, [...acc, cur].join("/")];
  }, [] as string[]);

  const handleCreateFolder = async (name: string) => {
    if (!name)
      return toast({
        title: "Tên thư mục không được để trống",
        variant: "error",
      });
    const res = await createFolder(name, {
      folderPath: currentFolderPath,
    });
    if (res.status === APIStatus.OK) {
      queryClient.invalidateQueries({
        queryKey: ["cloudinary-sub-folders", currentFolderPath],
      });
      form.setFieldValue("isCreatingFolder", false);
    } else {
      toast({
        title: "Tạo thư mục thất bại",
        description: res.message,
        variant: "error",
      });
    }
  };

  const handleOpenFolder = async (path: string) => {
    setCurrentFolderPath(path);
    await setCurrentFolderPathCookie(path);
  };

  const handleRename = async (id: string, name: string) => {
    const res = await renameFile(id, name);
    if (res.status === APIStatus.OK) {
      queryClient.invalidateQueries({
        queryKey: ["cloudinary-folder-files", currentFolderPath],
      });
    } else {
      toast({
        title: "Đổi tên thất bại",
        description: res.message,
        variant: "error",
      });
    }
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLButtonElement>,
    targetId: string
  ) => {
    e.preventDefault();
    const draggedId = e.dataTransfer?.getData("text/plain");
    if (!draggedId || !targetId) return;
    const res = await moveFiles([draggedId], {
      folderId: targetId,
    });
    if (res.status === APIStatus.OK) {
      queryClient.invalidateQueries({
        queryKey: ["cloudinary-folder-files", currentFolderPath],
      });
    }
  };

  const handleGetUrl = async (fileId: string) => {
    const res = await getFileLinks([fileId]);
    if (
      res.status !== APIStatus.OK ||
      !res.data ||
      (res.data && !res.data?.length)
    )
      return;
    navigator.clipboard.writeText(res.data[0]);
    toast({
      title: "Sao chép URL thành công",
      description: "URL đã được sao chép vào clipboard",
      variant: "info",
    });
  };

  return (
    <FileManagerContext.Provider
      value={{
        currentFolderPath,
        handleCreateFolder,
        handleOpenFolder,
        handleDrop,
        handleGetUrl,
        form,
        handleRename,
        singleSelect: !!singleSelect,
      }}
    >
      <PageBreadCrumb breadcrumbs={[{ name: "Quản lí file" }]} />

      <div className="flex bg-white">
        <FolderSidebar />
        <div className="flex-1 flex-col">
          <header className="flex h-14 items-center gap-4 border-b px-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem
                  className="cursor-pointer"
                  onClick={() => handleOpenFolder("")}
                >
                  Gốc
                </BreadcrumbItem>
                <BreadcrumbSeparator />

                {breadcrumbPaths.map((path, index) => {
                  return (
                    <Fragment key={path}>
                      <BreadcrumbItem
                        className="cursor-pointer"
                        key={path}
                        onClick={() => handleOpenFolder(path)}
                      >
                        {path.split("/").pop()}
                      </BreadcrumbItem>
                      {index < breadcrumbPaths.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex-1 justify-end flex gap-4 ">
              <form.Field
                name="selectedFiles"
                children={(field) =>
                  field.state.value.length ? (
                    <div
                      className="py-2 px-4 h-[40px] border rounded-sm flex cursor-pointer"
                      onClick={() => form.handleSubmit()}
                    >
                      {`Đã chọn ${field.state.value.length} tệp`}
                      <Separator orientation="vertical" className="mx-2" />
                      <div className="flex gap-4 items-center">
                        <Check
                          className="h-4 w-4 text-primary"
                          onClick={form.handleSubmit}
                        />
                        <TooltipWrap
                          content={`Bỏ chọn ${field.state.value.length} tệp đang chọn`}
                        >
                          <X
                            className="h-4 w-4 text-red-500 "
                            onClick={() => field.setValue([])}
                          />
                        </TooltipWrap>
                        <TooltipWrap content="Xóa các tệp đã chọn">
                          <Trash2
                            className="h-4 w-4 "
                            onClick={() => {
                              form.setFieldValue(
                                "deleteFileIds",
                                field.state.value.map((f) => f._id)
                              );
                            }}
                          />
                        </TooltipWrap>
                        <TooltipWrap content="Copy các tệp đã chọn">
                          <Files
                            className="h-4 w-4 "
                            onClick={() =>
                              form.setFieldValue(
                                "copyFileIds",
                                field.state.value.map((f) => f._id)
                              )
                            }
                          />
                        </TooltipWrap>
                        <TooltipWrap content="Cut các tệp đã chọn">
                          <Scissors
                            className="h-4 w-4 "
                            onClick={() =>
                              form.setFieldValue(
                                "moveFileIds",
                                field.state.value.map((f) => f._id)
                              )
                            }
                          />
                        </TooltipWrap>
                      </div>
                    </div>
                  ) : null
                }
              />
              {/* <form.Field name="layout">
                {(field) => (
                  <div className="flex border rounded-md overflow-hidden">
                    <Button
                      variant="ghost"
                      className={cn(
                        "rounded-none w-14",
                        field.state.value === "list" && "bg-gray-300"
                      )}
                      size="icon"
                      onClick={() => {
                        field.handleChange("list");
                        sessionStorage.setItem("layout", "list");
                      }}
                    >
                      <AlignJustify className="h-6 w-6" />
                    </Button>
                    <Separator orientation="vertical" />
                    <Button
                      variant="ghost"
                      className={cn(
                        "rounded-none w-14",
                        field.state.value === "grid" && "bg-gray-300"
                      )}
                      size="icon"
                      onClick={() => {
                        field.handleChange("grid");
                        sessionStorage.setItem("layout", "grid");
                      }}
                    >
                      <Grid2x2 className="h-6 w-6" />
                    </Button>
                  </div>
                )}
              </form.Field> */}
            </div>
          </header>
          <div className="flex flex-col gap-4 p-6">
            <form.Field
              name="search"
              children={(field) => (
                <Input
                  value={field.state.value}
                  onChange={(e) => field.setValue(e.target.value)}
                  placeholder="Tìm kiếm..."
                />
              )}
            />
            <FileGrid />
            {/* <form.Field
              name="layout"
              children={(field) =>
                field.state.value === "list" ? <FileTable /> : <FileGrid />
              }
            /> */}
          </div>
        </div>
        <CreateFolderDialog />
        <RenameDialog />
        <ConfirmDeleteDialog />
        <ConfirmDeleteFolderDialog />
        <RenameFolderDialog />
        <form.Field
          name="uploadingFiles"
          children={(field) => (
            <FileUploadList
              files={field.state.value}
              status={form.state.values.uploadingStatus}
            />
          )}
        />
      </div>
      <ImageViewer />
    </FileManagerContext.Provider>
  );
}
