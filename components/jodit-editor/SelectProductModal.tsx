import ProductSelector, { ArrayChipProduct } from "../selectors/product-selector";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

function SelectProductModal({
  open,
  onClose,
  productIds,
  onChange,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  productIds: number[];
  onChange: (value: number[]) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent className='min-h-[300px]'>
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm</DialogTitle>
        </DialogHeader>
        <ProductSelector
          value={productIds ?? []}
          multiple
          onChange={(v) => onChange(v as number[])}
        />
        <ArrayChipProduct
          prdIds={productIds}
          onDelete={(id) => onChange(productIds.filter((p) => p !== id))}
        />
        <DialogFooter className="flex gap-4 items-end">
          <DialogClose asChild>
            <Button variant="secondary">Đóng</Button>
          </DialogClose>
          <Button
            onClick={() => {
              onSubmit();
            }}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SelectProductModal;
