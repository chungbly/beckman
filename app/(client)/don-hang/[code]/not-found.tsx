import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";
import Link from "next/link";

function OrderNotFound() {
  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card className="border-red-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2 text-red-600">
            <Search className="h-6 w-6" />
            Không tìm thấy đơn hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-500">
          <p>
            Mã đơn hàng không hợp lệ hoặc bạn không được phép xem đơn hàng này.
          </p>
          <p className="mt-2">Vui lòng kiểm tra lại mã đơn hàng của bạn.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button
              variant="ghost"
              className="bg-[var(--rose-beige)] hover:bg-[var(--gray-beige)]"
            >
              Quay lại trang chủ
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default OrderNotFound;
