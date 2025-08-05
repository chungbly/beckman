import { APIStatus } from "@/client/callAPI";
import { renameFile, renameFolder } from "@/client/cloudinary.client";
import { useToast } from "@/hooks/use-toast";
import { getFileInFolderQuery, getSubFoldersQuery } from "@/query/cloudinary.query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useFileManager } from ".";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";

const RenameFolderDialog = () => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { form, currentFolderPath } = useFileManager();
  const { toast } = useToast();
  const { data: folders, } = useQuery(
    getSubFoldersQuery(currentFolderPath || "")
  );
  const queryClient = useQueryClient();

  const rename = async (fileId: string, name: string) => {
    setIsLoading(true);
    const res = await renameFolder(fileId, name);
    if (res.status === APIStatus.OK) {
      // @ts-ignore
      form.setFieldValue("selectedFileId", "");
      queryClient.invalidateQueries({
        queryKey: ["cloudinary-folder-files", currentFolderPath],
      });
    } else {
      toast({
        title: "Đổi tên thất bại",
        description: res.message,
        variant: "warning",
      });
    }
    setIsLoading(false);
  };
  return (
    <form.Field
      name="renameFolderId"
      children={(field) => {
        const id = field.state.value;
        const folder = folders?.find((f) => f.id === id);
        return (
          <Dialog
            open={!!folder}
            onOpenChange={() => form.setFieldValue("selectedFileId", "")}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Đổi tên</DialogTitle>
              </DialogHeader>

              <Input
                name="name"
                defaultValue={folder?.name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    rename(id, name);
                  }
                }}
                placeholder="Nhập tên mới"
              />
              <DialogFooter>
                <Button
                  onClick={() => {
                    rename(id, name);
                  }}
                >
                  {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Đổi tên
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      }}
    />
  );
};
export default RenameFolderDialog;
