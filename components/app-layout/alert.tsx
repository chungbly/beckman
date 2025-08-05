"use client";
import { cn } from "@/lib/utils";
import { useAlert } from "@/store/useAlert";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";

function SystemAlert() {
  const {
    title,
    description,
    header,
    content,
    isOpen,
    variant,
    footer,
    onClose,
    onSubmit,
  } = useAlert();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {header ? (
          header
        ) : (
          <DialogHeader>
            <DialogTitle>{title ?? "System Dialog"}</DialogTitle>
            <DialogDescription>
              {description ?? "This is a system dialog"}
            </DialogDescription>
          </DialogHeader>
        )}
        {content}
        {footer ? (
          footer
        ) : (
          <DialogFooter
            className={cn(
              "flex gap-2",
              variant === "destructive"
                ? "!flex-row-reverse !justify-start"
                : "flex"
            )}
          >
            <Button variant="secondary" onClick={onClose}>
              Đóng
            </Button>

            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={onSubmit}
            >
              {variant === "destructive" && <Trash2 className="w-4 h-4 mr-2" />}
              {variant === "destructive" ? "Xác nhận" : "OK"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SystemAlert;
