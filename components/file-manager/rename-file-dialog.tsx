import { APIStatus } from "@/client/callAPI";
import { renameFile } from "@/client/cloudinary.client";
import { useToast } from "@/hooks/use-toast";
import { getFileInFolderQuery } from "@/query/cloudinary.query";
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

const RenameDialog = () => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { form, currentFolderPath } = useFileManager();
  const { toast } = useToast();
  const { data: files } = useQuery(
    getFileInFolderQuery(currentFolderPath || "")
  );
  const queryClient = useQueryClient();

  const rename = async (fileId: string, name: string) => {
    setIsLoading(true);
    const res = await renameFile(fileId, name);
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
      name="selectedFileId"
      children={(field) => {
        const id = field.state.value;
        const file = files?.find((f) => f._id === id);
        return (
          <Dialog
            open={!!file}
            onOpenChange={() => form.setFieldValue("selectedFileId", "")}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Đổi tên</DialogTitle>
              </DialogHeader>

              <Input
                name="name"
                defaultValue={file?.display_name}
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
export default RenameDialog;
