import { ProductCard } from "@/components/product/product-card";
import { Product } from "@/types/product";

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <>
      {products.map((product, index) => (
        <ProductCard key={product._id + index} product={product} />
      ))}
    </>
  );
}

export default ProductGrid;
