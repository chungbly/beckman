import { useFileManager } from "@/components/file-manager";
import {
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CloudinaryFile, CloudinaryFolder } from "@/types/cloudinary";
import { IconClipboard } from "@tabler/icons-react";
import {
  Download,
  EyeIcon,
  FolderPen,
  Link,
  Scissors,
  Trash2,
} from "lucide-react";
import { Separator } from "../ui/separator";

const RightMenu = ({
  file,
  folder,
}: {
  file?: CloudinaryFile;
  folder?: CloudinaryFolder;
}) => {
  const { form, handleOpenFolder } = useFileManager();
  const { toast } = useToast();
  if (folder) {
    return (
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => handleOpenFolder(folder.path)}>
          <EyeIcon className="w-4 h-4 mr-2" />
          Xem
        </ContextMenuItem>
        {/* <ContextMenuItem onSelect={() => handleDownload(file.id)}>
          <Download className="w-4 h-4 mr-2" />
          Tải về
        </ContextMenuItem> */}
        <Separator orientation="horizontal" />

        {/* <ContextMenuItem
          onSelect={() => form.setFieldValue("copyFileIds", [file.id])}
        >
          <IconClipboard className="w-4 h-4 mr-2" />
          Copy
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => form.setFieldValue("moveFileIds", [file.id])}
        >
          <Scissors className="w-4 h-4 mr-2" />
          Cut
        </ContextMenuItem> */}
        <Separator orientation="horizontal" />
        <form.Field
          name="renameFolderId"
          children={(field) => (
            <ContextMenuItem
              onClick={() => {
                field.handleChange(folder.id);
              }}
            >
              <FolderPen className="w-4 h-4 mr-2" />
              Đổi tên
            </ContextMenuItem>
          )}
        />

        <ContextMenuItem
          onClick={() => {
            form.setFieldValue("deleteFolderIds", [folder.id]);
          }}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Xoá
        </ContextMenuItem>
      </ContextMenuContent>
    );
  }

  const handleDownload = () => {
    if (!file) return;
    fetch(file.secure_url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = blobUrl;
        downloadLink.download = file.filename;
        downloadLink.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch((error) => {});
  };

  if (file) {
    return (
      <form.Field name="selectedFiles">
        {(field) => {
          const selectedFiles = field.state.value;
          const isSelected = selectedFiles?.length
            ? selectedFiles?.some((s) => s._id === file._id)
            : true;
          return (
            <ContextMenuContent forceMount>
              <ContextMenuItem
                onSelect={() =>
                  form.setFieldValue("imageToViewUrl", file.secure_url)
                }
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                Xem
              </ContextMenuItem>

              <ContextMenuItem onSelect={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Tải về
              </ContextMenuItem>
              <Separator orientation="horizontal" />

              <ContextMenuItem
                className={cn(!isSelected && "opacity-50 cursor-not-allowed")}
                onSelect={() => {
                  const selectedFiles = form.getFieldValue("selectedFiles");
                  const fildeIds = selectedFiles?.map((file) => file._id) || [];
                  form.setFieldValue("copyFileIds", fildeIds);
                }}
              >
                <IconClipboard className="w-4 h-4 mr-2" />
                Copy
              </ContextMenuItem>
              <ContextMenuItem
                className={cn(!isSelected && "opacity-50 cursor-not-allowed")}
                onSelect={() => {
                  const selectedFiles = form.getFieldValue("selectedFiles");
                  const fildeIds = selectedFiles?.map((file) => file._id) || [];
                  form.setFieldValue("moveFileIds", fildeIds);
                }}
              >
                <Scissors className="w-4 h-4 mr-2" />
                Cut
              </ContextMenuItem>
              <Separator orientation="horizontal" />
              <form.Field
                name="selectedFileId"
                children={(field) => (
                  <ContextMenuItem
                    onClick={() => {
                      field.handleChange(file._id);
                    }}
                  >
                    <FolderPen className="w-4 h-4 mr-2" />
                    Đổi tên
                  </ContextMenuItem>
                )}
              />
              <ContextMenuItem
                onSelect={() => {
                  navigator.clipboard.writeText(file.url);
                  toast({
                    title: "Đã sao chép link",
                    variant: "info",
                  });
                }}
              >
                <Link className="w-4 h-4 mr-2" />
                Copy Link
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  form.setFieldValue("deleteFileIds", [file._id]);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xoá
              </ContextMenuItem>
            </ContextMenuContent>
          );
        }}
      </form.Field>
    );
  }
  return null;
};

export default RightMenu;
