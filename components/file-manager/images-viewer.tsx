import Image from "next/image";
import { useFileManager } from ".";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

function ImageViewer() {
  const { form } = useFileManager();
  return (
    <form.Field
      name="imageToViewUrl"
      children={(field) => {
        const isVideo =
          field.state.value?.endsWith(".mp4") ||
          field.state.value?.includes("/video/");
        return (
          <Dialog
            open={!!field.state.value}
            onOpenChange={() => field.handleChange("")}
          >
            <DialogTitle className="invisible hidden">
              Product Images
            </DialogTitle>
            <DialogContent className="p-8 max-w-screen-xl">
              <div className="w-full h-[80vh]">
                {isVideo ? (
                  <video
                    src={field.state.value}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={field.state.value}
                    alt="product image"
                    fill
                    className="rounded-lg object-contain"
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        );
      }}
    />
  );
}

export default ImageViewer;
