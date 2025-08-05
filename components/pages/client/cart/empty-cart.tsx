import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

function EmptyCart() {
  return (
    <div className="text-center py-12 border rounded-md bg-white">
      <div className="flex justify-center mb-4">
        <ShoppingBag className="w-16 h-16 text-gray-300" />
      </div>
      <h2 className="text-xl font-bold mb-2">Giỏ hàng của bạn đang trống</h2>
      <p className="text-gray-500 mb-6">
        Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
      </p>
      <Link href="/">
        <Button variant='ghost' className="bg-[var(--rose-beige)] hover:bg-[var(--gray-beige)]">
          Tiếp tục mua sắm
        </Button>
      </Link>
    </div>
  );
}

export default EmptyCart;
