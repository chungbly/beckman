import { Customer } from "@/types/customer";
import { ExternalOrder } from "@/types/external-order";
import { formatCurrency } from "@/utils/number";
import { Separator } from "@radix-ui/react-separator";
import Image from "next/image";
import Link from "next/link";
import { LineInfo } from "../../dat-hang/page";
import { ProductRatingDialog } from "../rating-dialog";

function ExternalOrderItem({
  externalOrder,
  customer,
}: {
  externalOrder: ExternalOrder;
  customer: Customer;
}) {
  const { finalPrice, discount, items, totalPrice } = externalOrder || {};
  const totalSalePrice = items.reduce((acc, item) => {
    return acc + (item.salePrice || item.finalPrice) * item.quantity;
  }, 0);
  const totalBasePrice = items.reduce((acc, item) => {
    return acc + item.basePrice * item.quantity;
  }, 0);
  return (
    <div className="lg:col-span-2 max-sm:order-2">
      {items.map((product) => {
        return (
          <div key={product._id}>
            <div className="grid grid-cols-3 lg:grid-cols-9 gap-4">
              <div className="col-span-1 lg:col-span-3 gap-4 flex lg:items-center">
                <div className="w-[100px] h-[100px] min-w-[100px] relative">
                  <Image
                    src={product.seo?.thumbnail}
                    alt={product.name}
                    fill
                    className="object-cover rounded-sm"
                  />
                </div>
                <Link
                  href={`/${product.seo?.slug}`}
                  className="hidden lg:block col-span-2 hover:text-[var(--red-brand)] hover:underline"
                >
                  {product.name}
                </Link>
              </div>
              <div className="flex-1 max-lg:flex max-lg:flex-col col-span-2 lg:col-span-6 grid grid-cols-8 items-center gap-4">
                <Link
                  href={`/${product.seo?.slug}`}
                  className="block w-full lg:hidden col-span-2 hover:text-[var(--red-brand)] hover:underline"
                >
                  {product.name}
                </Link>
                {/* Không yêu cầu làm product variant selector */}
                <div className="col-span-2 flex w-full lg:flex-col items-center justify-between lg:justify-center text-xs text-gray-500 mt-1 ">
                  <p className="text-center">Màu: {product.color}</p>
                  <p className="text-center">Size: {product.size}</p>
                </div>
                <div className="col-span-2 lg:col-span-4 flex lg:grid lg:grid-cols-3 gap-4 max-lg:flex-row-reverse max-lg:justify-between w-full">
                  <span className="text-xs text-muted-foreground flex items-center">
                    Số lượng: {product.quantity}
                  </span>

                  <div className="text-left lg:text-right max-lg:flex-1 col-span-2 flex flex-1 flex-wrap lg:justify-end items-center gap-2">
                    {!!product.finalPrice &&
                      product.finalPrice < product.basePrice && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatCurrency(product.basePrice)}
                        </div>
                      )}
                    <div className="font-bold text-[var(--red-brand)]">
                      {formatCurrency(product.finalPrice)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ProductRatingDialog
              product={product}
              externalOrder={externalOrder}
              customer={customer}
            />
          </div>
        );
      })}

      <div className="space-y-2  p-2  mt-4">
        <p className="font-bold">Tổng tiền hàng</p>
        <LineInfo title={"Tổng tiền hàng"} value={formatCurrency(totalPrice)} />
        <LineInfo
          title={"Tiết kiệm"}
          value={
            <span className="text-[var(--red-brand)]">
              {formatCurrency(totalBasePrice - totalSalePrice)}
            </span>
          }
        />
        <p className="font-bold">Chi tiết thanh toán</p>
        <LineInfo
          title={"Tổng tiền hàng"}
          value={formatCurrency(totalSalePrice)}
        />
        <LineInfo
          title={"Voucher ưu đãi"}
          value={
            <span className="text-[var(--red-brand)]">
              {formatCurrency(discount - (totalBasePrice - totalSalePrice))}
            </span>
          }
        />
        <Separator className="bg-[#B9A68E] h-[1px] w-full" />
        <LineInfo
          title={"Tổng thanh toán"}
          value={
            <span className="text-[var(--red-brand)] font-bold">
              {formatCurrency(finalPrice)}
            </span>
          }
        />
      </div>
    </div>
  );
}

export default ExternalOrderItem;
