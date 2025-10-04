"use client";

import { Clock, Search, X } from "lucide-react";

import { getTags } from "@/client/tags.client";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getProductsQuery } from "@/query/product.query";
import { useConfigs } from "@/store/useConfig";
import { debounce } from "@/utils/debounce";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const configs = useConfigs((s) => s.configs);
  const ALL_PRODUCT_CATEGORY_SLUG = (configs?.["ALL_PRODUCT_CATEGORY_SLUG"] ||
    "all-product") as string;
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const { data: products, isLoading } = useQuery(
    getProductsQuery(
      {
        searchText: searchQuery,
        status: true,
      },
      100,
      1
    )
  );

  const { data: tags, isLoading: isLoadingTags } = useQuery({
    queryKey: ["get-tags", searchQuery],
    queryFn: async () => {
      const res = await getTags(searchQuery);
      return res.data || [];
    },
  });

  const handleSetSearchQuery = useCallback(
    debounce((searchTerm: string) => {
      setSearchQuery(searchTerm);
    }, 500),
    []
  );
  const handleRecentSearchClick = (searchTerm: string) => {
    setSearchQuery(searchTerm);
  };

  useEffect(() => {
    const recentSearches = localStorage.getItem("recent-searches") || "[]";
    try {
      const value = JSON.parse(recentSearches) as string[];
      setRecentSearches(value?.filter((v) => v));
    } catch (e) {
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    setRecentSearches((prev) => {
      localStorage.setItem(
        "recent-searches",
        JSON.stringify([...prev, searchQuery])
      );
      return Array.from(
        new Set([searchQuery, ...prev].filter((v, index) => v && index < 5))
      );
    });
  }, [searchQuery]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="w-full flex items-center justify-end">
          <div
            className={cn(
              "max-w-[200px] cursor-pointer h-6 w-[200px] mr-1 float-end hidden sm:block bg-transparent border-0 border-b border-black",
              className
            )}
          />
          <Search className="w-5 h-5 text-[var(--brown-brand)] sm:text-black" />
        </div>
      </DialogTrigger>
      <DialogContent className="max-sm:h-full max-sm:max-h-full sm:max-w-[600px] p-0 max-h-[700px] flex flex-col overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Tìm kiếm sản phẩm</DialogTitle>
        </DialogHeader>

        {/* Search Header */}
        <div className="flex items-center gap-4 p-6 pb-4 bg-gradient-to-r border-b">
          <div className="relative flex-1 px-2">
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              id="search-input"
              onChange={(e) => handleSetSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const input = document.querySelector(
                    "#search-input"
                  ) as HTMLInputElement;
                  if (!input.value) return;
                  setOpen(false);
                  router.push(`/tim-kiem?keyword=${input.value}`);
                }
              }}
              className="pl-4 pr-4 h-12 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400 bg-white/80 backdrop-blur-sm"
              autoFocus
            />
            <Search
              onClick={() => {
                const input = document.querySelector(
                  "#search-input"
                ) as HTMLInputElement;
                if (!input.value) return;
                setOpen(false);
                router.push(`/tim-kiem?keyword=${input.value}`);
              }}
              className="cursor-pointer absolute right-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-700"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-slate-50/30">
          {searchQuery.trim().length > 0 ? (
            <div className="h-full overflow-y-auto">
              {isLoading || isLoadingTags ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <div className="text-slate-600">Đang tìm kiếm...</div>
                  </div>
                </div>
              ) : (products && products.length > 0) || (tags && tags.length) ? (
                <div className="p-6 pt-0 bg-white">
                  <div className="flex items-center justify-between mb-6 max-sm:sticky top-0 bg-white ">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Kết quả tìm kiếm
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700"
                    >
                      {`${
                        (products?.length || 0) + (tags?.length || 0)
                      } kết quả`}
                    </Badge>
                  </div>
                  <div className="grid gap-1 max-sm:max-h-full max-h-[400px] overflow-y-auto">
                    {tags?.map((tag) => {
                      const currentParams = new URLSearchParams(
                        searchParams.toString()
                      );

                      currentParams.set("tags", JSON.stringify([tag.name]));

                      const tags = `?${currentParams.toString()}`;

                      return (
                        <Link
                          href={`/danh-muc/${ALL_PRODUCT_CATEGORY_SLUG}${tags}`}
                          key={tag.name}
                          onClick={() => setOpen(false)}
                          className="py-1 hover:bg-gray-100 cursor-pointer"
                        >
                          {tag.name.split(" ").map((char, index) => {
                            if (
                              searchQuery
                                .toLowerCase()
                                .includes(char?.toLowerCase())
                            ) {
                              return <b key={index}>{char} </b>;
                            }
                            return `${char} `;
                          })}
                        </Link>
                      );
                    })}
                    {products?.map((product) => (
                      <Link
                        href={`/tim-kiem?keyword=${product.name}`}
                        key={product._id}
                        onClick={() => setOpen(false)}
                        className="py-1 hover:bg-gray-100 cursor-pointer"
                      >
                        {product.name.split(" ").map((char, index) => {
                          if (
                            searchQuery
                              .toLowerCase()
                              .includes(char?.toLowerCase())
                          ) {
                            return <b key={index}>{char} </b>;
                          }
                          return `${char} `;
                        })}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-15 h-15 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    Không tìm thấy sản phẩm
                  </h3>
                  <p className="text-slate-500">
                    Thử tìm kiếm với từ khóa khác nhé
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 pt-2">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Tìm kiếm gần đây
              </h3>
              <div className="grid gap-1 max-sm:max-h-full max-h-[400px] overflow-y-auto">
                {!!recentSearches?.length &&
                  recentSearches.map((searchTerm, index) => (
                    <button
                      key={index}
                      className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 text-left group"
                    >
                      <div
                        className="flex items-center gap-2"
                        onClick={() => handleRecentSearchClick(searchTerm)}
                      >
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <Clock className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                        </div>
                        <span className="text-slate-700 group-hover:text-slate-900 font-medium">
                          {searchTerm}
                        </span>
                      </div>

                      <X
                        onClick={() => {
                          setRecentSearches((prev) => {
                            const newData = prev.filter(
                              (v) => v !== searchTerm
                            );
                            localStorage.setItem(
                              "recent-searches",
                              JSON.stringify(newData)
                            );
                            return newData;
                          });
                        }}
                      />
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
