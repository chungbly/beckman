"use client";

import { Plus, Save, Trash2 } from "lucide-react";

import { APIStatus } from "@/client/callAPI";
import { updateConfig } from "@/client/configs.client";
import CategorySelector from "@/components/category-selector";
import ProductSelector, {
  ArrayChipProduct,
} from "@/components/selectors/product-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "@tanstack/react-form";

export interface SuggestionSearch {
  searchKeyWords: string[];
  categoryIds: string[];
  productIds: number[];
}

export default function SearchSettings({
  configs,
}: {
  configs: Record<string, unknown>;
}) {
  const { toast } = useToast();
  const SUGGESTIONS_SEARCH = configs?.[
    "SUGGESTIONS_SEARCH"
  ] as SuggestionSearch;

  const form = useForm({
    defaultValues: {
      searchKeyWords: SUGGESTIONS_SEARCH?.searchKeyWords || [],
      categoryIds: SUGGESTIONS_SEARCH?.categoryIds || [],
      productIds: SUGGESTIONS_SEARCH?.productIds || [],
    },
    onSubmit: async ({ value }) => {
      const res = await updateConfig(
        "SUGGESTIONS_SEARCH",
        JSON.stringify(value)
      );
      if (res.status !== APIStatus.OK) {
        toast({
          title: "Lỗi",
          description: res.message,
          variant: "error",
        });
      } else {
        toast({
          title: "Thành công",
          description: "Cập nhật cài đặt thành công",
        });
      }
    },
  });

  const handleAddSearchKeyWord = () => {
    const input = document.querySelector(
      "#search-keywords"
    ) as HTMLInputElement;
    if (!input) return;
    const value = input.value;

    form.setFieldValue("searchKeyWords", [
      ...form.getFieldValue("searchKeyWords"),
      value,
    ]);
    input.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b flex items-center justify-between p-2">
        <div>
          <h1 className="text-2xl font-bold">Cài đặt kết quả tìm kiếm</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Cài đặt gợi ý tìm kiếm, danh mục và sản phẩm nổi bật khi không có
            kết quả tìm kiếm phù hợp.
          </p>
        </div>

        <Button onClick={form.handleSubmit}>
          <Save className="h-4 w-4 mr-2" />
          Lưu
        </Button>
      </header>

      <main className=" px-4 py-8">
        <Tabs defaultValue="suggestions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions">
              Từ khoá gợi ý tìm kiếm
            </TabsTrigger>
            <TabsTrigger value="categories">Danh mục phổ biến</TabsTrigger>
            <TabsTrigger value="products">Sản phẩm nổi bật</TabsTrigger>
          </TabsList>

          {/* Search Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Từ khoá gợi ý tìm kiếm</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Cài đặt từ khoá gợi ý tìm kiếm
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Suggestion */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập từ khoá gợi ý..."
                    id="search-keywords"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddSearchKeyWord();
                      }
                    }}
                  />
                  <Button onClick={handleAddSearchKeyWord}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm
                  </Button>
                </div>

                {/* Suggestions List */}
                <div className="space-y-2">
                  <form.Field name="searchKeyWords">
                    {(field) => {
                      const searchKeyWords = field.state.value;
                      return searchKeyWords.map((suggestion, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <span>{suggestion}</span>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              field.handleChange(
                                searchKeyWords.filter((s) => s !== suggestion)
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ));
                    }}
                  </form.Field>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Danh mục nổi bật</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Cài đặt danh mục nổi bật
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Category */}
                <form.Field name="categoryIds">
                  {(field) => {
                    return (
                      <CategorySelector
                        value={field.state.value}
                        onChange={(v) =>
                          field.handleChange(v.map((a) => a.value))
                        }
                      />
                    );
                  }}
                </form.Field>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Featured Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sản phẩm nổi bật</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Cài đặt sản phẩm nổi bật (mục : &quot;Có thể bạn sẽ thích&quot;)
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <form.Field name="productIds">
                  {(field) => {
                    return (
                      <>
                        <ProductSelector
                          multiple
                          value={field.state.value}
                          onChange={(v) => field.handleChange(v)}
                        />
                        <ArrayChipProduct
                          prdIds={field.state.value}
                          onDelete={(id) => {
                            field.handleChange(
                              field.state.value.filter((d) => d !== id)
                            );
                          }}
                        />
                      </>
                    );
                  }}
                </form.Field>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
