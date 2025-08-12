"use client";

import AceEmmetEditor from "@/components/ace-editor";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { InfoIcon } from "lucide-react";

export default function SitemapViewer() {
  const { data: sitemapContent } = useQuery({
    queryKey: ["sitemap"],
    queryFn: async () => {
      const res = await fetch("/sitemap.xml");
      return res.text();
    },
  });

  return (
    <div className="p-6 flex flex-col gap-4">
      <PageBreadCrumb breadcrumbs={[{ name: "Sitemap" }]} />
      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Sitemap Manager</h1>
        <Alert variant="default" className="bg-muted">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Sitemap mặc định luôn được cập nhật tự động bởi hệ thống. Bạn không
            cần phải chỉnh sửa file này.
          </AlertDescription>
        </Alert>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            Sitemap Preview
          </CardTitle>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => window.open("/sitemap.xml", "_blank")}
          >
            Xem Sitemap Thực Tế
          </Button>
        </CardHeader>
        <CardContent className="h-[65vh]">
          <AceEmmetEditor
            language="xml"
            value={sitemapContent || ""}
            readOnly={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
