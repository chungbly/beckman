"use client";
import { GetProductQuery } from "@/client/product.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import { getProductsQuery } from "@/query/product.query";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import ProductTableFilter from "./filter";
import ProductTableSkeleton from "./product-table-skeleton";
import ProductTable from "./table";

function Container({ query }: { query: Partial<GetProductQuery> }) {
  const searchParams = useSearchParams();
  const limit = searchParams.get("limit") ?? 20;
  const page = searchParams.get("page") ?? 1;
  const { data, isLoading } = useQuery(
    getProductsQuery(query, limit ? +limit || 20 : 20, +page || 1, true, false)
  );
  const prds = data?.items ?? [];
  const meta = data?.meta;
  return (
    <div className="p-2 sm:p-6 flex flex-col gap-4">
      <ProductTableFilter />
      <PageBreadCrumb
        breadcrumbs={[{ name: "Danh sách sản phẩm", href: "/admin/products" }]}
      />
      {isLoading ? (
        <ProductTableSkeleton />
      ) : (
        <ProductTable
          products={prds}
          meta={meta!}
          query={query as Partial<GetProductQuery>}
        />
      )}
    </div>
  );
}

export default Container;
