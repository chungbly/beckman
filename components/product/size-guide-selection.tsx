import { ChevronRight } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

function SizeSelectionGuide({ src }: { src: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer flex items-center justify-between">
          <p className="text-sm">Hướng dẫn chọn size</p>
          <ChevronRight className="w-4 h-4" />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className="relative w-full aspect-square">
          <Image
            src={src}
            alt="Hướng dẫn chọn size"
            fill
            className="object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SizeSelectionGuide;
