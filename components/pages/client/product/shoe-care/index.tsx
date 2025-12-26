import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/number";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function ShoeCare({
  products,
  addons,
  className,
  handleChangeAddons,
}: {
  products: Product[];
  addons: number[];
  handleChangeAddons: (id: number) => void;
  className?: string;
}) {
  const isMobile = useIsMobile();
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm">Bảo vệ giày mua kèm</span>
      </div>
      <div className="max-w-full overflow-x-auto flex gap-2 items-center">
        {products.map((product,index) => (
          <div
            key={product._id}
            className="flex items-center gap-2 min-w-[300px] w-[300px] bg-[var(--light-beige)]"
          >
            <div className="relative aspect-square w-[100px]">
              <Image
                src={product.images?.[0]?.urls?.[0] || product.seo?.thumbnail}
                alt={product.name}
                fill
              />
            </div>
            <div className="flex flex-col ">
              <Link
                target={isMobile ? "_blank" : "_self"}
                href={`/${product.seo?.slug}`}
                className="text-sm font-bold hover:underline"
              >
                {product.name}
              </Link>
              {/* <p className="text-xs">{product.discribles[0] || ""}</p> */}
              <div className="flex items-center justify-between gap-4">
                <p className="text-[var(--red-brand)] font-bold ">
                  {formatCurrency(product.salePrice || product.basePrice)}
                </p>
                {!!product.finalPrice &&
                  product.finalPrice < product.basePrice && (
                    <p className="line-through text-xs sm:text-sm decoration-[var(--red-brand)]">
                      {formatCurrency(product.basePrice)}
                    </p>
                  )}
              </div>
              <div
                className="cursor-pointer flex items-center justify-around px-2 bg-[#15374E] text-white text-xs sm:text-sm"
                onClick={() => handleChangeAddons(product.kvId)}
              >
                {addons.includes(product.kvId) ? (
                  "Đã thêm"
                ) : (
                  <>
                    <ShoppingCart size={12} />
                    <span>
                      {product.salePrice > 0
                        ? `Tiết kiệm: ${formatCurrency(
                            product.basePrice - product.finalPrice
                          )}`
                        : "Thêm"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShoeCare;
