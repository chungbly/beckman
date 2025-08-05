import React from "react";
import FileManager from ".";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

function FileManagerDialog<T extends boolean = false>({
  children,
  singleSelect,
  onSelect,
}: {
  children: React.ReactNode;
  singleSelect?: T;
  onSelect?: (images: T extends true ? string : string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <div
        onClick={(e) => {
          setOpen(true);
        }}
      >
        {children}
      </div>
      <Dialog modal={false} open={open} onOpenChange={() => setOpen(false)}>
        <DialogContent className="max-w-[90vw]">
          <DialogTitle className="hidden">Chọn ảnh</DialogTitle>
          <FileManager
            singleSelect={singleSelect}
            onSelect={(images) => {
              onSelect?.(
                singleSelect
                  ? (images[0] as T extends true ? string : string[])
                  : (images as T extends true ? string : string[])
              );
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FileManagerDialog;
