"use client";

import { Search, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

import { SuggestionSearch } from "@/app/(admin)/admin/search-setting/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoriesQuery } from "@/query/category.query";
import { getProductsQuery } from "@/query/product.query";
import { useConfigs } from "@/store/useConfig";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { ProductCard } from "./product-card";

export default function EmptyProducts() {
  const configs = useConfigs((s) => s.configs);
  const SUGGESTIONS_SEARCH = (configs?.["SUGGESTIONS_SEARCH"] ||
    {}) as SuggestionSearch;
  const categoryIds = SUGGESTIONS_SEARCH?.categoryIds || [];
  const productIds = SUGGESTIONS_SEARCH?.productIds || [];
  const searchKeyWords = SUGGESTIONS_SEARCH?.searchKeyWords || [];

  const { data: products, isLoading: isLoadingProducts } = useQuery(
    getProductsQuery(
      {
        ids: productIds,
      },
      100,
      1
    )
  );

  const { data: categories, isLoading: isLoadingCategories } = useQuery(
    getCategoriesQuery(
      {
        ids: categoryIds,
      },
      100,
      1
    )
  );

  return (
    <div className="min-h-screen bg-transparent">
      {/* Main Content */}
      <main className="px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          {/* Empty State Illustration */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-16 w-16 text-muted-foreground" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight mb-4">
              Không tìm thấy
            </h1>

            <p className="text-lg text-muted-foreground mb-2">
              Chúng tôi không tìm thấy sản phẩm nào phù hợp
              {/* <span className="font-semibold text-foreground">
                "wireless headphones"
              </span> */}
            </p>

            <p className="text-muted-foreground">
              Hãy thử điều chỉnh tìm kiếm của bạn hoặc duyệt qua các danh mục
              phổ biến bên dưới.
            </p>
          </div>

          {/* Search Suggestions */}
          <div className="mb-12">
            <h2 className="text-lg font-semibold mb-4">Gợi ý tìm kiếm:</h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {searchKeyWords.map((keyword, index) => (
                <Link key={index} href={`/tim-kiem?keyword=${keyword}`}>
                  <Button variant="outline" size="sm">
                    {keyword}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Categories */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Danh mục phổ biến</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isLoadingCategories
                ? Array.from({ length: 3 }).map((_, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <CardContent className="p-6 text-center">
                        <Skeleton className="w-full h-8" />
                      </CardContent>
                    </Card>
                  ))
                : categories?.map((cate) => (
                    <Card
                      key={cate._id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <CardContent className="p-6 text-center">
                        {/* <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-green-100 flex items-center justify-center">
                        <span className="text-2xl">👕</span>
                      </div> */}
                        <Link
                          href={`/danh-muc/${cate.seo?.slug}`}
                          className="font-semibold mb-1"
                        >
                          {cate.name}
                        </Link>
                        {/* <p className="text-sm text-muted-foreground">
                        {cate.seo?.description}
                      </p> */}
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </div>

          {/* Featured Products */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Có thể bạn sẽ thích</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {isLoadingProducts
                ? Array.from({ length: 3 }).map((_, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <Skeleton className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                          {/* <span className="text-4xl">🎧</span> */}
                        </Skeleton>
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-8 w-1/4" />
                      </CardContent>
                    </Card>
                  ))
                : products?.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
            </div>
          </div>

          {/* Action Buttons */}
          {/* <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/">Browse All Products</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/categories">View Categories</Link>
            </Button>
          </div> */}
        </div>
      </main>
    </div>
  );
}
