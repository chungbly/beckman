import {
  GetProductQuery,
  getSuggestionProducts,
} from "@/client/product.client";
import { cn } from "@/lib/utils";
import ProductScrollAbleList from "../../home-page/flash-deal/product-scrollable-list";

async function SuggestionProducts({
  title,
  query,
  className,
}: {
  title: string;
  query: Partial<GetProductQuery>;
  className?: string;
}) {
  const res = await getSuggestionProducts(query, 20, 1);
  const product = res.data;
  if (!product || !product?.length) return null;
  return (
    <div className={cn("mt-4 col-span-full ", className)}>
      <h2 className="text-xl font-bold mb-2 text-[var(--brown-brand)]">
        {title}
      </h2>
      <ProductScrollAbleList products={product} className="h-[350px]"/>
    </div>
  );
}

export default SuggestionProducts;
