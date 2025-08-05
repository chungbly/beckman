import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as React from "react";
import { useFileManager } from ".";

export function CreateFolderDialog() {
  const [folderName, setFolderName] = React.useState("");
  const { handleCreateFolder, form } = useFileManager();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateFolder(folderName);
    setFolderName("");
  };

  return (
    <form.Field
      name="isCreatingFolder"
      children={(field) => (
        <Dialog
          open={field.state.value}
          onOpenChange={() => form.setFieldValue("isCreatingFolder", false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo thư mục mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 py-4">
                <Label htmlFor="name">Tên thư mục</Label>
                <Input
                  id="name"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <DialogFooter>
                <Button type="submit">Tạo</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    />
  );
}
