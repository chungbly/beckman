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
        <p className="cursor-pointer flex items-center justify-between hover:underline sm:text-lg text-sm">
          Hướng dẫn chọn size
        </p>
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
