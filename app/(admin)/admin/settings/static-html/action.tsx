"use client";

import { APIStatus } from "@/client/callAPI";
import { createStaticHTML } from "@/client/static-html.client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

function StaticHTMLActions() {
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const orderInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const name = searchParams.get("name");
  const limit = Number(searchParams.get("limit")) || 100;
  const page = Number(searchParams.get("page")) || 1;
  const handleUploadOrderClick = () => {
    orderInputRef.current?.click(); // Kích hoạt input
  };
  const { toast } = useToast();
  const handleUploadClick = () => {
    inputRef.current?.click(); // Kích hoạt input
  };
  const parseFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        resolve(content);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);

    const content = await parseFile(file);
    const res = await createStaticHTML({
      name: file.name,
      content: content,
      isActive: true,
    });

    setIsLoading(false);
    if (res.status !== APIStatus.OK) {
      return toast({
        variant: "error",
        title: "Có lỗi xảy ra",
        description: res?.message || "Không thể tải lên file HTML",
      });
    }
    queryClient.invalidateQueries({
      queryKey: ["get-static-html", name, limit, page],
    });
    toast({
      variant: "success",
      title: "Thành công",
      description: "Tải lên thành công",
    });
  };

  return (
    <div className="flex flex-col items-end justify-end">
      <div className="flex gap-2 items-center">
        <div>
          <Button onClick={handleUploadOrderClick} disabled={isLoading}>
            <Upload className="w-4 h-4 mr-2" />
            {isLoading ? "Đang tải lên..." : "Upload file HTML"}
          </Button>
          <input
            id="upload-orders-input"
            type="file"
            ref={orderInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
}

export default StaticHTMLActions;
