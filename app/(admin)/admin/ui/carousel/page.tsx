"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { CarouselSlide } from "@/types/carousel";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import {
  CircleHelp,
  Grip,
  ImagePlus,
  Loader,
  Plus,
  Save,
  Trash,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { APIStatus } from "@/client/callAPI";
import { updateConfig } from "@/client/configs.client";
import FileManagerDialog from "@/components/file-manager/file-manager-dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TooltipWrap } from "@/components/ui/tooltip";
import { useAlert } from "@/store/useAlert";
import { useConfigs } from "@/store/useConfig";

function SortableSlide({
  slide,
  handleUpdateSlide,
  handleDeleteSlide,
}: {
  slide: CarouselSlide;
  handleUpdateSlide: (slide: CarouselSlide) => void;
  handleDeleteSlide: () => Promise<void>;
}) {
  const { setAlert, closeAlert } = useAlert();
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: slide._id!,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: "transform 100ms ease", // Add smooth transition
        zIndex: 1,
      }
    : undefined;
  const onDelete = () => {
    setAlert({
      title: "Xác nhận xóa",
      description: "Bạn có chắc chắn muốn xóa slide này?",
      variant: "destructive",
      onSubmit: async () => {
        await handleDeleteSlide();
        closeAlert();
      },
    });
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative bg-white p-3 rounded-lg mb-3 shadow  hover:bg-gray-100 transition-colors duration-200 touch-none"
    >
      <div className="flex items-center justify-between">
        <Grip {...attributes} {...listeners} className="cursor-move " />

        <Badge>{slide.order + 1}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-2 mt-1.5">
            <Label className="text-sm">Desktop Image</Label>
            <TooltipWrap content="Ảnh dùng cho thiết bị desktop">
              <CircleHelp size={16} className="text-blue-500" />
            </TooltipWrap>
          </div>
          <FileManagerDialog
            singleSelect
            onSelect={(image) => {
              if (image) {
                handleUpdateSlide({
                  ...slide,
                  image,
                });
              }
            }}
          >
            <div className="relative w-full h-[185px] mt-1.5 group cursor-pointer">
              {slide.image ? (
                <Image
                  src={slide.image}
                  alt="Mobile"
                  fill
                  className="object-cover rounded"
                />
              ) : (
                <div className="flex w-full h-[185px] cursor-pointer items-center justify-center aspect-square bg-gray-200 rounded-lg border border-dashed border-primary">
                  <ImagePlus className="h-6 w-6" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                Click to change image
              </div>
            </div>
          </FileManagerDialog>
        </div>
        <div>
          <div className="flex items-center gap-2 mt-1.5">
            <Label className="text-sm">Mobile Image</Label>
            <TooltipWrap content="Ảnh dùng cho thiết bị mobile, tỉ lệ 390:600">
              <CircleHelp size={16} className="text-blue-500" />
            </TooltipWrap>
          </div>
          <FileManagerDialog
            singleSelect
            onSelect={(image) => {
              if (image) {
                handleUpdateSlide({
                  ...slide,
                  mobileImage: image,
                });
              }
            }}
          >
            <div className="relative w-[120px] h-[185px] mt-1.5 group cursor-pointer mx-auto">
              {slide.mobileImage ? (
                <Image
                  src={slide.mobileImage}
                  alt="Mobile"
                  fill
                  className="object-cover rounded"
                />
              ) : (
                <div className="flex cursor-pointer h-[185px] w-[120px]  items-center justify-center aspect-square bg-gray-200 rounded-lg border border-dashed border-primary">
                  <ImagePlus className="h-6 w-6" />
                </div>
              )}
              <div className="absolute text-center inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                Click to change image
              </div>
            </div>
          </FileManagerDialog>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm">Href (Đường dẫn)</Label>
          <TooltipWrap content="Link được mở khi click vào slide đó, lưu ý: nếu đường link dẫn sang trang web bên ngoài thì phải bắt đầu https://">
            <CircleHelp size={16} className="text-blue-500" />
          </TooltipWrap>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
            defaultValue={slide.href}
            placeholder="Nhập đường dẫn cho ảnh khi click"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleUpdateSlide({
                  ...slide,
                  href: (e.target as HTMLInputElement).value,
                });
              }
            }}
          />
          <div className="flex gap-2 items-center min-w-fit ">
            <Checkbox
              defaultChecked={slide.newTab}
              onCheckedChange={(checked: boolean) => {
                handleUpdateSlide({
                  ...slide,
                  newTab: checked,
                });
              }}
            />
            <Label className="min-w-fit">Mở trong tab mới</Label>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={slide.active}
            onCheckedChange={(checked) => {
              handleUpdateSlide({
                ...slide,
                active: checked,
              });
            }}
          />
          <Label>Active</Label>
        </div>
        <Button variant="destructive" size="icon" onClick={onDelete}>
          <Trash className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CarouselPage() {
  const configs = useConfigs((s) => s.configs);

  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSave = async (updatedSlides: CarouselSlide[]) => {
    const res = await updateConfig(
      "SLIDES_CAROUSEL",
      JSON.stringify(updatedSlides)
    );
    if (!res || res.status !== APIStatus.OK) {
      return toast({
        title: "Thất bại",
        description: res.message || "Thao tác thất bại",
        variant: "error",
      });
    }
    toast({ title: "Thành công", description: "Cập nhật slide thành công" });
  };
  const handleUpdateSlide = (slide: CarouselSlide) => {
    const index = slides.findIndex((s) => s._id === slide._id);
    if (index !== -1) {
      const updatedSlides = [...slides];
      updatedSlides[index] = slide;
      setSlides(updatedSlides);
    }
  };

  const handleDeleteSlide = async (slide: CarouselSlide) => {
    const updatedSlides = slides.filter((s) => s._id !== slide._id);
    setSlides(updatedSlides);
  };

  const handleAddSlide = () => {
    const newSlide: CarouselSlide = {
      _id: `temp-${Date.now()}`,
      image: "",
      mobileImage: "",
      newTab: false,
      order: slides.length,
      active: true,
      href: "",
    };
    setSlides([...slides, newSlide]);
  };

  async function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = slides.findIndex((slide) => slide._id === active.id);
    const newIndex = slides.findIndex((slide) => slide._id === over.id);

    const updatedSlides = [...slides];
    const [movedSlide] = updatedSlides.splice(oldIndex, 1);
    updatedSlides.splice(newIndex, 0, movedSlide);

    const reorderedSlides = updatedSlides.map((slide, index) => ({
      ...slide,
      order: index,
    }));
    setSlides(reorderedSlides);
  }

  useEffect(() => {
    if (configs["SLIDES_CAROUSEL"]) {
      setSlides((configs["SLIDES_CAROUSEL"] as CarouselSlide[]) || []);
    }
  }, [configs]);

  return (
    <div className="px-3">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Carousel Management</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các slide hiển thị trên trang chủ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={async () => {
              setIsLoading(true);
              await handleSave(slides);
              setIsLoading(false);
            }}
          >
            {isLoading ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Lưu
          </Button>
          <Button variant='outline' onClick={handleAddSlide}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm Slide
          </Button>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext
          items={slides.map((slide) => slide._id!)}
          strategy={rectSortingStrategy}
        >
          <div className="grid gril-cols-1 sm:grid-cols-3 gap-4 relative">
            {slides.map((slide) => (
              <SortableSlide
                key={slide._id}
                slide={slide}
                handleDeleteSlide={async () => await handleDeleteSlide(slide)}
                handleUpdateSlide={handleUpdateSlide}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {slides.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Chưa có slide nào được thêm vào, hãy thêm một slide mới
        </div>
      )}
    </div>
  );
}
