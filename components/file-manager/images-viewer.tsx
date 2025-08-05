import Image from "next/image";
import { useFileManager } from ".";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

function ImageViewer() {
  const { form } = useFileManager();
  return (
    <form.Field
      name="imageToViewUrl"
      children={(field) => (
        <Dialog
          open={!!field.state.value}
          onOpenChange={() => field.handleChange("")}
        >
          <DialogTitle className="invisible hidden">Product Images</DialogTitle>
          <DialogContent className="p-8 max-w-screen-xl">
            <div className="w-full h-[80vh]">
              <Image
                src={field.state.value}
                alt="product image"
                fill
                className="rounded-lg object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    />
  );
}

export default ImageViewer;
