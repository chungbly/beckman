import { Product } from "@/types/product";
import RenderHTMLFromCMS from "../app-layout/render-html-from-cms";

export default function ProductDescription({ product }: { product: Product }) {
  return (
    <div className="mt-4 px-2 bg-[#F0F0F0]">
      <div className="container mx-auto">
        <RenderHTMLFromCMS className="max-sm:text-sm" html={product.description} />
      </div>
    </div>
  );
}
