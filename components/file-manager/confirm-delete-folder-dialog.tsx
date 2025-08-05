import { APIStatus } from "@/client/callAPI";
import { deleteFolders } from "@/client/cloudinary.client";
import { useFileManager } from "@/components/file-manager";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
function ConfirmDeleteFolderDialog() {
  const { form, currentFolderPath } = useFileManager();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  return (
    // @ts-ignore
    <form.Field
      name="deleteFolderIds"
      children={(field) => (
        <Dialog
          open={!!field.state.value?.length}
          onOpenChange={() => field.handleChange([])}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xoá</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xoá folder này?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={async () => {
                  setIsLoading(true);
                  const res = await deleteFolders(field.state.value);
                  setIsLoading(false);
                  if (res.status !== APIStatus.OK) {
                    return toast({
                      title: "Xoá thất bại",
                      description: res.message,
                      variant: "error",
                    });
                  }
                  toast({
                    title: "Xoá thành công",
                    variant: "success",
                  });
                  field.handleChange([]);
                  queryClient.invalidateQueries({
                    queryKey: ["cloudinary-sub-folders", currentFolderPath],
                  });
                }}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Xoá
              </Button>
              <Button variant="secondary">Huỷ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    />
  );
}

export default ConfirmDeleteFolderDialog;
