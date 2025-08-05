"use client";
import CartProductItem from "@/components/pages/client/cart/cart-item";
import { CartItem } from "@/store/useCart";
import { useConfigs } from "@/store/useConfig";
import { Customer } from "@/types/customer";
import { Order } from "@/types/order";
import { formatCurrency } from "@/utils/number";
import { Separator } from "@radix-ui/react-separator";
import { Truck } from "lucide-react";
import { LineInfo } from "../../dat-hang/page";
import { ProductRatingDialog } from "../rating-dialog";

function InternalOrderItem({
  internalOrder,
  customer,
}: {
  internalOrder: Order;
  customer: Customer;
}) {
  const {
    finalPrice,
    discount,
    items,
    totalPrice,
    totalSalePrice,
    shippingFee,
    totalSaved,
    saved,
  } = internalOrder || {};
  const configs = useConfigs((s) => s.configs);
  const SHIPPING_FEE_DEFAULT = (configs?.["SHIPPING_FEE_DEFAULT"] ||
    35000) as number;
  return (
    <div className="lg:col-span-2 max-sm:order-2">
      {items.map((product) => {
        const flattenCartItems = [] as CartItem[];
        items.forEach((i) => {
          const { appliedProducts, ...rest } = i;
          if (appliedProducts?.length) {
            flattenCartItems.push(
              ...appliedProducts.map((a) => ({
                ...a,
                productId: a.kvId,
                isSelected: true,
              }))
            );
            flattenCartItems.push({
              ...rest,
              productId: i.kvId,
              isSelected: true,
              addons: i.addons.map((a) => a.kvId),
            });
          } else {
            flattenCartItems.push({
              ...i,
              productId: i.kvId,
              isSelected: true,
              addons: i.addons.map((a) => a.kvId),
            });
          }
        });
        const item = flattenCartItems.find((i) => i.productId === product.kvId);
        return (
          <div key={product._id}>
            <CartProductItem
              className="border-none bg-white lg:px-0"
              product={product}
              isEditable={false}
              shoesCareProducts={product.addons || []}
              vouchers={product.vouchers || []}
              voucherAppliedProducts={product.appliedProducts || []}
              item={item!}
              items={flattenCartItems}
            />
            <ProductRatingDialog
              product={product}
              internalOrder={internalOrder}
              customer={customer}
            />
          </div>
        );
      })}

      <div className="space-y-2  p-2  mt-4">
        <LineInfo
          title={
            <div className="flex items-center gap-2 mt-2">
              <Truck fill="#15374E" />
              <span>Phí vận chuyển</span>
            </div>
          }
          value={formatCurrency(SHIPPING_FEE_DEFAULT)}
        />
        <Separator />
        <p className="font-bold">Tổng tiền hàng</p>
        <LineInfo
          title={"Tổng tiền hàng"}
          value={formatCurrency(totalSalePrice)}
        />
        <LineInfo
          title={"Tiết kiệm"}
          value={
            <span className="text-[var(--red-brand)]">
              {formatCurrency(saved)}
            </span>
          }
        />
        <p className="font-bold">Chi tiết thanh toán</p>
        <LineInfo
          title={"Tổng tiền hàng"}
          value={formatCurrency(totalSalePrice)}
        />
        <LineInfo
          title={"Giảm phí vận chuyển"}
          value={formatCurrency(shippingFee - SHIPPING_FEE_DEFAULT)}
        />
        <LineInfo
          title={"Voucher ưu đãi"}
          value={
            <span className="text-[var(--red-brand)]">
              {formatCurrency(discount)}
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

export default InternalOrderItem;
