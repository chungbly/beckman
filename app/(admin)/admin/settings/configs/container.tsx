"use client";

import { APIStatus } from "@/client/callAPI";
import {
  deleteConfig,
  updateConfig,
  updateStatusConfig,
} from "@/client/configs.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAlert } from "@/store/useAlert";
import { Configs } from "@/types/configs";
import { Copy, Pencil, Search, Trash2 } from "lucide-react";
import { CreateConfigDialog } from "./create-config-dialog";
import { useState } from "react";
export default function ConfigManagement({ configs }: { configs: Configs[] }) {
  const { toast } = useToast();
  const { setAlert } = useAlert();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConfigs =
    configs?.filter(
      (config) =>
        config.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.value.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    });
  };

  const handleEdit = async (key: string, value: string) => {
    const res = await updateConfig(key, value);
    if (res.status !== APIStatus.OK) {
      toast({
        title: "Có lỗi xảy ra",
        description: res.message,
        variant: "error",
      });
      return;
    }
    window.location.reload();
    toast({
      title: "Cập nhật config thành công",
    });
  };

  const toggleStatus = async (key: string, isShow: boolean) => {
    const res = await updateStatusConfig(key, isShow);
    if (res.status !== APIStatus.OK) {
      toast({
        title: "Có lỗi xảy ra",
        description: res.message,
        variant: "error",
      });
      return;
    }
    window.location.reload();
    toast({
      title: "Cập nhật config thành công",
    });
  };

  const handleDelete = (config: Configs) => {
    setAlert({
      title: "Xác nhận xóa config",
      description: (
        <p>
          Bạn có chắc chắn muốn xóa config có key: <b>{config.key}</b> không?
        </p>
      ),
      variant: "destructive",
      onSubmit: async () => {
        const res = await deleteConfig(config.key);
        if (res.status !== APIStatus.OK) {
          toast({
            title: "Có lỗi xảy ra",
            description: res.message,
            variant: "error",
          });
          return;
        }
        toast({
          title: "Đã xóa config",
        });
        window.location.reload();
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <PageBreadCrumb breadcrumbs={[{ name: "Configuration" }]} />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Config Management</h1>
        <CreateConfigDialog />
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-lg max-w-full overflow-x-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead className="w-[100px]">Trạng thái</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-[200px] pl-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConfigs.map((config, index) => (
              <TableRow key={config._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Switch
                    checked={config.isShow}
                    onCheckedChange={(v) => toggleStatus(config.key, v)}
                  />
                </TableCell>
                <TableCell>{config.description}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="cursor-pointer p-3"
                    onClick={() => handleCopy(config.key)}
                  >
                    {config.key}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm max-w-[500px] ">
                  <div className="pr-4 max-h-[300px] overflow-auto">
                    {config.value}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2 pl-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(config.value)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Dialog modal={false}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Chỉnh sửa config với key: {config.key}
                          </DialogTitle>
                        </DialogHeader>
                        <Textarea
                          id="edit-config-input"
                          defaultValue={config.value}
                        />
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="secondary">Huỷ</Button>
                          </DialogClose>
                          <Button
                            onClick={async () => {
                              const input = document.getElementById(
                                "edit-config-input"
                              ) as HTMLInputElement;
                              await handleEdit(config.key, input.value);
                            }}
                          >
                            Lưu
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(config)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
