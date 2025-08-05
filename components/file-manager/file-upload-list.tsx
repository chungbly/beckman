"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  FileIcon,
  Loader2,
  MaximizeIcon,
  MinimizeIcon,
  X,
} from "lucide-react";
import { useState } from "react";
import { useFileManager } from ".";
import { TooltipWrap } from "../ui/tooltip";
import { bytesToSize } from "@/utils";

export default function FileUploadList({
  files,
  status,
}: {
  files: FileList | null;
  status: "uploading" | "error" | "completed" | null;
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const { form } = useFileManager();
  
  if (!files?.length || !status) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 w-80 bg-background border border-border rounded-lg shadow-lg overflow-hidden"
    >
      <div className="p-4 bg-primary text-primary-foreground font-semibold flex justify-between items-center">
        <span>Đang tải lên {files.length} file</span>
        <div className="flex gap-2 items-center">
          <Button
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-primary-foreground hover:bg-slate-50/20"
          >
            {isMinimized ? (
              <MaximizeIcon className="h-4 w-4" />
            ) : (
              <MinimizeIcon className="h-4 w-4" />
            )}
          </Button>
          <TooltipWrap content="Sau khi ẩn, tiến trình vẫn chạy trong nền">
            <Button
              className="hover:bg-slate-50/20"
              size="icon"
              onClick={() => {
                // @ts-ignore
                form.setFieldValue("uploadingFiles", null);
                form.setFieldValue("uploadingStatus", null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </TooltipWrap>
        </div>
      </div>
      <AnimatePresence>
        {!isMinimized && (
          <motion.ul
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="max-h-80 overflow-y-auto"
          >
            {Array.from(files).map((file) => (
              <motion.li
                key={file.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium truncate max-w-[180px]">
                      {file.name}
                    </span>
                  </div>
                  {/* <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button> */}
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <div className="text-gray-400 text-sm">
                    {bytesToSize(file.size)}
                  </div>
                  {/* // @ts-ignore */}
                  <form.Field
                    name="uploadingStatus"
                    children={(field) => {
                      const status = field.state.value;
                      if (status === "uploading")
                        return (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        );
                      if (status === "completed")
                        return (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        );
                      if (status === "error")
                        return (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        );
                    }}
                  />
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
