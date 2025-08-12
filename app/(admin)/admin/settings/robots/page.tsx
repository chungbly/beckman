"use client";

import { APIStatus } from "@/client/callAPI";
import { updateConfig } from "@/client/configs.client";
import AceEmmetEditor from "@/components/ace-editor";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { InfoIcon, Save } from "lucide-react";
import { useEffect, useState } from "react";

export default function RobotsViewer() {
  const { toast } = useToast();

  const { data: robotsContent } = useQuery({
    queryKey: ["robots"],
    queryFn: async () => {
      const res = await fetch("/robots.txt", {
        next: {
          revalidate: 0,
        },
      });
      return res.text();
    },
  });

  const [content, setContent] = useState(robotsContent);

  const handleSave = async () => {
    const res = await updateConfig("ROBOTS", content);
    if (res.status !== APIStatus.OK) {
      toast({
        title: "Lỗi",
        description: res.message,
        variant: "error",
      });
    } else {
      toast({
        title: "Thành công",
        description: "Sitemap đã được cập nhật",
      });
    }
  };

  useEffect(() => {
    setContent(robotsContent);
  }, [robotsContent]);

  return (
    <div className="p-6 flex flex-col gap-4">
      <PageBreadCrumb breadcrumbs={[{ name: "Robots.txt" }]} />

      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Robots.txt Manager
        </h1>
        <Alert variant="default" className="bg-muted">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Robots.txt: Là file giúp người quản trị hỗ trợ điều hướng các bot
            (ví dụ Google bot) không quét các URL không cần thiết, hoặc các URL
            mang tính riêng tư, đặc biệt là các URL truy cập các phân hệ quản
            trị (CMS)
          </AlertDescription>
        </Alert>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            Robots.txt Preview
          </CardTitle>
          <div className="flex flex-row items-center space-x-4">
            <Button
              variant="secondary"
              onClick={() => window.open("/robots.txt", "_blank")}
            >
              Xem Robots.txt Thực Tế
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-5 w-5" />
              Lưu
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[65vh]">
          <AceEmmetEditor
            language="xml"
            value={robotsContent || ""}
            onChange={(value) => setContent(value)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
