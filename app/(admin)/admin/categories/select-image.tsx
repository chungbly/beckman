import FileManagerDialog from "@/components/file-manager/file-manager-dialog";
import { cn } from "@/lib/utils";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";

function ImageSelector({
  value,
  onChange,
  className = "",
}: {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full h-[80px] group border border-neutral-100 rounded-lg shadow-sm",
        className
      )}
    >
      {value ? (
        <>
          <Image
            src={value}
            alt="OG Image"
            fill
            sizes="200px"
            className="rounded-sm object-contain"
          />
          <X
            onClick={() => {
              onChange("");
            }}
            className="absolute h-4 w-4 top-1 cursor-pointer right-1 p-1 hidden group-hover:block rounded-full bg-white/80 hover:bg-white shadow-sm"
          />
        </>
      ) : (
        <FileManagerDialog
          singleSelect
          onSelect={(image) => {
            if (image) {
              onChange(image);
            }
          }}
        >
          <div className="absolute cursor-pointer rounded-sm border-dashed border-primary border inset-0 flex items-center justify-center bg-gray-200">
            <ImagePlus className="w-6 h-6" />
          </div>
        </FileManagerDialog>
      )}
    </div>
  );
}

export default ImageSelector;
