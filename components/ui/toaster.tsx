"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { CircleCheckBig, CircleX, Info, OctagonAlert } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();
  const getIcon = (variant: "success" | "error" | "warning" | "info" | null | undefined) => {
    switch (variant) {
      case "success":
        return <CircleCheckBig className="w-8 h-8 text-primary" />;
      case "error":
        return <CircleX className="w-8 h-8 text-red-500" />;
      case "warning":
        return <OctagonAlert className="w-8 h-8 text-yellow-500" />;
      case "info":
        return <Info className="w-8 h-8 text-blue-500" />;
      default:
        return null;
    }
  };
  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        ...props
      }) {
        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="flex items-center gap-4">
              {getIcon(variant || "success")}
              <div>
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
