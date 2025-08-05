"use client";

import { APIStatus } from "@/client/callAPI";
import { createConfig } from "@/client/configs.client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import * as React from "react";

export function CreateConfigDialog() {
  const { toast } = useToast();
  const [key, setKey] = React.useState("");
  const [value, setValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [description, setDescription] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key || !value) {
      toast({
        title: "Vui lòng nhập đầy đủ thông tin",
        variant: "error",
      });
      return;
    }

    const res = await createConfig({ key, value, description });
    if (res.status === APIStatus.OK) {
      toast({
        title: "Tạo config thành công",
      });
      setKey("");
      setValue("");
      setOpen(false);
      window.location.reload();
    } else {
      toast({
        title: "Tạo config thất bại",
        description: res.message,
        variant: "error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Tạo config mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Config</DialogTitle>
            <DialogDescription>
              Add a new configuration key-value pair to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="key">
                Key
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Nhập key..."
                className="uppercase"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">
                Value
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Nhập giá trị..."
                className="font-mono"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Mô tả</Label>
              <Textarea
                id="value"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả..."
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Config</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
