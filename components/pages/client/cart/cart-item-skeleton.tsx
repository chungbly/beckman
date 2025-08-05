import { Skeleton } from "@/components/ui/skeleton";

function CartItemSkeleton() {
  return (
    <div className="border rounded-md p-4 bg-white">
      <div className="flex gap-4">
        <Skeleton className="w-20 h-20 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export default CartItemSkeleton;
