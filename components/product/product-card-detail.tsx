import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/number";
import { forwardRef, Ref } from "react";
import { ProductDetailFormValue } from "../pages/client/product/mobile-footer-actionbar";

interface Props {
  product: Product;
  children?: React.ReactNode;
  className?: string;
  form: ProductDetailFormValue;
}

function ProductCardDetail(
  { product, children, className, form }: Props,
  ref: Ref<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      className={cn(
        "border border-neutral-200 rounded-md bg-[var(--light-beige)] ",
        className
      )}
    >
      <h3 className="font-bold text-base sm:text-2xl p-1 px-2 line-clamp-2 ">
        {product.name}
      </h3>
      {children}

      <div className=" space-y-2">
        <div className="p-3 space-y-1 border-t border-neutral-100">
          {product.discribles.map((feature, index) => (
            <div key={index} className="flex items-start gap-1 ">
              <span className="text-[#4E2919] font-bold">+</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
        <form.Subscribe
          selector={(state) => ({
            basePrice: state.values.basePriceTotal,
            finalPrice: state.values.finalPriceTotal,
          })}
        >
          {({ basePrice, finalPrice }) => {
            return (
              <div className="px-3 flex items-center justify-between bg-[#D9C6B6] gap-2">
                <span className="text-[var(--red-brand)] font-bold text-2xl sm:text-3xl">
                  {formatCurrency(finalPrice)}
                </span>
                {product.finalPrice < basePrice && (
                  <span className="line-through text-sm sm:text-xl decoration-[var(--red-brand)]">
                    {formatCurrency(basePrice)}
                  </span>
                )}
              </div>
            );
          }}
        </form.Subscribe>
      </div>
    </div>
  );
}

export default forwardRef(ProductCardDetail);
