import { Product } from "@/types/product";
import RenderHTMLFromCMS from "../app-layout/render-html-from-cms";
import ReadMore from "../ui/read-more";

export default function ProductDescription({ product }: { product: Product }) {
  return (
    <div className="mt-4 px-2">
      <ReadMore maxHeight={400}>
        <RenderHTMLFromCMS html={product.description} />
      </ReadMore>
    </div>
  );
}
