"use client";

import { APIStatus } from "@/client/callAPI";
import { updateConfig } from "@/client/configs.client";
import FileManagerDialog from "@/components/file-manager/file-manager-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/types/product";
import {
  Calendar,
  Code,
  Download,
  Edit,
  Eye,
  Globe,
  ImagePlus,
  MoreVertical,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 } from "uuid";

export interface CustomPage extends SEO {
  id: string;
  description: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  html?: string;
  css?: string;
  project?: string;
}

const DEFAULT_PAGE: CustomPage = {
  id: "",
  thumbnail: "",
  keywords: "",
  title: "",
  slug: "",
  description: "",
  status: "draft",
  createdAt: "",
  updatedAt: "",
  html: "",
  css: "",
};

export default function PageManager({
  configs,
}: {
  configs: Record<string, unknown>;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const PAGE_MANAGER = configs["PAGE_MANAGER"] as CustomPage[];
  const [pages, setPages] = useState<CustomPage[]>(PAGE_MANAGER);

  const [selectedPage, setSelectedPage] = useState<CustomPage | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [newPage, setNewPage] = useState(DEFAULT_PAGE);

  const handleSave = async (silent: boolean = false) => {
    const res = await updateConfig("PAGE_MANAGER", JSON.stringify(pages));
    if (res.status === APIStatus.OK) {
      if (!silent) {
        toast({
          title: "Lưu thành công",
          variant: "success",
        });
      }
      return true;
    } else {
      if (!silent) {
        toast({
          title: "Lưu thất bại",
          variant: "error",
        });
      }
      return false;
    }
  };

  const handleCreatePage = () => {
    const page: CustomPage = {
      ...newPage,
      id: v4(),
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      html: "",
      css: "",
    };
    setPages([...pages, page]);
    setNewPage(DEFAULT_PAGE);
    setIsCreateDialogOpen(false);
  };

  const handleEditPage = (page: CustomPage) => {
    setSelectedPage(page);
    setIsEditDialogOpen(true);
  };

  const handleEditHtmlPage = async (page: CustomPage) => {
    const success = await handleSave(true);
    if (success) {
      router.push(`/admin/ui/layout-editor/${page.id}`);
    }
  };

  const handleUpdatePage = () => {
    if (selectedPage) {
      setPages(
        pages.map((p) =>
          p.id === selectedPage.id
            ? {
                ...selectedPage,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : p
        )
      );
      setIsEditDialogOpen(false);
      setSelectedPage(null);
    }
  };

  const handleDeletePage = (id: string) => {
    setPages(pages.filter((p) => p.id !== id));
  };

  const handlePreview = (page: CustomPage) => {
    setSelectedPage(page);
    setIsPreviewDialogOpen(true);
  };

  const handleExportPage = (page: CustomPage) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${page.title}</title>
          <style>
              ${page.css || ""}
          </style>
      </head>
      <body>
          ${page.html || ""}
      </body>
      </html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${page.slug}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const togglePageStatus = (id: string) => {
    setPages(
      pages.map((p) =>
        p.id === id
          ? {
              ...p,
              status: p.status === "published" ? "draft" : "published",
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Page</h1>
            <p className="text-gray-600 mt-2">
              Tạo và quản lý các trang web của bạn
            </p>
          </div>
          <div className="flex items-center gap-10">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleSave()}
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu
            </Button>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              modal={false}
            >
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo Page Mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Tạo Page Mới</DialogTitle>
                  <DialogDescription>
                    Tạo một trang web mới với thông tin cơ bản
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Tiêu đề</Label>
                    <Input
                      id="title"
                      value={newPage.title}
                      onChange={(e) =>
                        setNewPage({ ...newPage, title: e.target.value })
                      }
                      placeholder="Nhập tiêu đề trang"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={newPage.slug}
                      onChange={(e) =>
                        setNewPage({ ...newPage, slug: e.target.value })
                      }
                      placeholder="vi-du: about-us"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      value={newPage.description}
                      onChange={(e) =>
                        setNewPage({ ...newPage, description: e.target.value })
                      }
                      placeholder="Mô tả ngắn về trang này"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="keywords">Từ khóa</Label>
                    <Input
                      id="keywords"
                      value={newPage.keywords}
                      onChange={(e) =>
                        setNewPage({ ...newPage, keywords: e.target.value })
                      }
                      placeholder="Từ khóa để tìm kiếm"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="thumbnail">Hình ảnh</Label>
                    <div className="relative h-[80px] w-[80px] group">
                      {newPage.thumbnail ? (
                        <Image
                          src={newPage.thumbnail}
                          alt={newPage.title}
                          fill
                          className="rounded"
                        />
                      ) : (
                        <FileManagerDialog
                          singleSelect
                          onSelect={(image) => {
                            if (image) {
                              setNewPage({ ...newPage, thumbnail: image });
                            }
                          }}
                        >
                          <div className="absolute cursor-pointer rounded-sm border-dashed border-primary border inset-0 flex items-center justify-center bg-gray-200">
                            <ImagePlus className="w-6 h-6" />
                          </div>
                        </FileManagerDialog>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button onClick={handleCreatePage}>Tạo Page</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Pages</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pages.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã Publish</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {pages.filter((p) => p.status === "published").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {pages.filter((p) => p.status === "draft").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hôm nay</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  pages.filter(
                    (p) =>
                      p.createdAt === new Date().toISOString().split("T")[0]
                  ).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pages List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách Pages</CardTitle>
            <CardDescription>
              Quản lý tất cả các trang web của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{page.title}</h3>
                      <Badge
                        variant={
                          page.status === "published" ? "default" : "secondary"
                        }
                      >
                        {page.status === "published" ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{page.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {page.slug}
                      </span>

                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {page.updatedAt}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePageStatus(page.id)}
                    >
                      {page.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPage(page)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditHtmlPage(page)}
                        >
                          <Code className="w-4 h-4 mr-2" />
                          Chỉnh sửa HTML
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePreview(page)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExportPage(page)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Xuất HTML
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePage(page.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa Page</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin và nội dung của trang
              </DialogDescription>
            </DialogHeader>
            {selectedPage && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Tiêu đề</Label>
                  <Input
                    id="edit-title"
                    value={selectedPage.title}
                    onChange={(e) =>
                      setSelectedPage({
                        ...selectedPage,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-slug">Slug</Label>
                  <Input
                    id="edit-slug"
                    value={selectedPage.slug}
                    onChange={(e) =>
                      setSelectedPage({
                        ...selectedPage,
                        slug: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Mô tả</Label>
                  <Textarea
                    id="edit-description"
                    value={selectedPage.description}
                    onChange={(e) =>
                      setSelectedPage({
                        ...selectedPage,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-keywords">Từ khoá</Label>
                  <Textarea
                    id="edit-keywords"
                    value={selectedPage.keywords}
                    onChange={(e) =>
                      setSelectedPage({
                        ...selectedPage,
                        keywords: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-thumbnail">Hình ảnh</Label>
                  <div className="relative h-[80px] w-[80px] group">
                    {selectedPage.thumbnail ? (
                      <Image
                        src={selectedPage.thumbnail}
                        alt={selectedPage.title}
                        fill
                        className="rounded"
                      />
                    ) : (
                      <FileManagerDialog
                        singleSelect
                        onSelect={(image) => {
                          if (image) {
                            setSelectedPage({
                              ...selectedPage,
                              thumbnail: image,
                            });
                          }
                        }}
                      >
                        <Button>Chọn hình ảnh</Button>
                      </FileManagerDialog>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button onClick={handleUpdatePage}>Cập nhật</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog
          open={isPreviewDialogOpen}
          onOpenChange={setIsPreviewDialogOpen}
        >
          <DialogContent className="sm:max-w-[90vw] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Preview: {selectedPage?.title}</DialogTitle>
            </DialogHeader>
            <div
              className="border rounded-lg overflow-hidden"
              style={{ height: "70vh" }}
            >
              {selectedPage && (
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <style>
                        body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
                        ${selectedPage.css || ""}
                      </style>
                    </head>
                    <body>
                      ${selectedPage.html || "<p>Chưa có nội dung</p>"}
                    </body>
                    </html>
                  `}
                  className="w-full h-full"
                  title="Page Preview"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
