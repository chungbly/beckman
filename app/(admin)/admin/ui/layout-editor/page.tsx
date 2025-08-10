"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Download,
  Edit,
  Eye,
  Globe,
  MoreVertical,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";

interface Page {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  author: string;
  htmlContent?: string;
  cssContent?: string;
}

export default function PageManager() {
  const [pages, setPages] = useState<Page[]>([
    {
      id: "1",
      title: "Trang chủ",
      slug: "home",
      description: "Trang chủ của website",
      status: "published",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20",
      author: "Admin",
      htmlContent: '<div class="hero"><h1>Chào mừng đến với website</h1></div>',
      cssContent:
        ".hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }",
    },
    {
      id: "2",
      title: "Giới thiệu",
      slug: "about",
      description: "Trang giới thiệu về công ty",
      status: "draft",
      createdAt: "2024-01-18",
      updatedAt: "2024-01-18",
      author: "Editor",
      htmlContent:
        '<div class="about"><h2>Về chúng tôi</h2><p>Nội dung giới thiệu...</p></div>',
      cssContent: ".about { padding: 2rem; background: #f8f9fa; }",
    },
  ]);

  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [newPage, setNewPage] = useState({
    title: "",
    slug: "",
    description: "",
    status: "draft" as const,
  });

  const handleCreatePage = () => {
    const page: Page = {
      id: Date.now().toString(),
      ...newPage,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      author: "Current User",
      htmlContent: "",
      cssContent: "",
    };
    setPages([...pages, page]);
    setNewPage({ title: "", slug: "", description: "", status: "draft" });
    setIsCreateDialogOpen(false);
  };

  const handleEditPage = (page: Page) => {
    setSelectedPage(page);
    setIsEditDialogOpen(true);
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

  const handlePreview = (page: Page) => {
    setSelectedPage(page);
    setIsPreviewDialogOpen(true);
  };

  const handleExportPage = (page: Page) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${page.title}</title>
          <style>
              ${page.cssContent || ""}
          </style>
      </head>
      <body>
          ${page.htmlContent || ""}
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
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
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
                        <Globe className="w-4 h-4" />/{page.slug}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {page.author}
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
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Thông tin</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="space-y-4">
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
                </TabsContent>
                <TabsContent value="html" className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="html-content">HTML Content</Label>
                    <Textarea
                      id="html-content"
                      value={selectedPage.htmlContent || ""}
                      onChange={(e) =>
                        setSelectedPage({
                          ...selectedPage,
                          htmlContent: e.target.value,
                        })
                      }
                      className="min-h-[300px] font-mono"
                      placeholder="Nhập HTML content..."
                    />
                  </div>
                </TabsContent>
                <TabsContent value="css" className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="css-content">CSS Styles</Label>
                    <Textarea
                      id="css-content"
                      value={selectedPage.cssContent || ""}
                      onChange={(e) =>
                        setSelectedPage({
                          ...selectedPage,
                          cssContent: e.target.value,
                        })
                      }
                      className="min-h-[300px] font-mono"
                      placeholder="Nhập CSS styles..."
                    />
                  </div>
                </TabsContent>
              </Tabs>
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
                        ${selectedPage.cssContent || ""}
                      </style>
                    </head>
                    <body>
                      ${selectedPage.htmlContent || "<p>Chưa có nội dung</p>"}
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
