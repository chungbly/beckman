"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProductsQuery } from "@/query/product.query";
import { useCartStore } from "@/store/useCart";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { v4 } from "uuid";
import { useStore } from "zustand";

export default function CheckoutPage() {
  const items = useStore(useCartStore, (state) => state.items);
  const productIds = items.flatMap((item) => [item.productId, item.addons]);

  const { data: products, isLoading } = useQuery({
    ...getProductsQuery(
      {
        ids: productIds,
      },
      productIds.length,
      1
    ),
    enabled: !!productIds.length,
    placeholderData: keepPreviousData,
  });

  const subtotal =
    products?.reduce((acc, product) => {
      const quantity =
        items.find((p) => p.productId === product.kvId)?.quantity || 0;
      if (product) {
        return acc + product.finalPrice * quantity;
      }
      return acc;
    }, 0) || 0;
  const discount = 5;
  const shipping = 0;
  const total = subtotal - discount + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="col-span-1 sm:col-span-2 flex  justify-between sm:px-12">
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-primary"></div>
            <span className="text-center mt-2 text-sm font-medium">Cart</span>
          </div>
          <div className="flex-1 h-[2px] bg-gray-200 mx-4 relative top-[6px]" />
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-gray-200"></div>
            <span className="text-center mt-2 text-sm text-muted-foreground">
              Billing & address
            </span>
          </div>
          <div className="flex-1 h-[2px] bg-gray-200 mx-4 relative top-[6px]" />
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-gray-200"></div>
            <span className="text-center mt-2 text-sm text-muted-foreground">
              Payment
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Cart{" "}
                <span className="text-muted-foreground">
                  ({items.length} items)
                </span>
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground pb-4 border-b">
                <div className="col-span-2">Product</div>
                <div className="text-center">Quantity</div>
                <div className="text-right">Total Price</div>
              </div>

              {isLoading && !products ? (
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="col-span-2 flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                      <div className="flex items-center justify-center w-full h-full text-neutral-400">
                        Loading...
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">Loading...</h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        Loading...
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Loading...
                      </div>
                    </div>
                  </div>
                </div>
              ) : !products?.length ? (
                <div>
                  <div className="flex items-center justify-center w-full h-full text-neutral-400">
                    No products
                  </div>
                </div>
              ) : (
                products.map((product) => {
                  const quantity =
                    items.find((p) => p.productId === product.kvId)?.quantity || 0;
                  return (
                    <div
                      key={v4()}
                      className="grid grid-cols-4 gap-4 items-center"
                    >
                      <div className="col-span-2 flex gap-4">
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                          {product.seo?.thumbnail ? (
                            <Image
                              src={product.seo?.thumbnail || ""}
                              alt={product.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-neutral-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <div className="text-sm text-muted-foreground mt-1">
                            <span>size: {product.size}</span>
                            <Badge
                              variant="outline"
                              className="ml-2 bg-[currentColor] w-3 h-3 rounded-full p-0"
                            />
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            ${product.basePrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-col">
                        <div className="border rounded-lg flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MinusIcon className="h-3 w-3" />
                          </Button>
                          <Input
                            className="w-8 p-0 h-8 text-center border-0 focus-visible:ring-0 focus-visible:border-0 focus-visible:ring-offset-0"
                            value={quantity}
                          />

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <PlusIcon className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground ml-2">
                          Tồn kho: {product.stock}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-4">
                        <span className="font-medium">
                          ${(product.finalPrice * quantity).toFixed(2)}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-8">
              <Link
                href="/shop"
                className="text-sm font-medium text-primary hover:underline"
              >
                ← Continue shopping
              </Link>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-card rounded-lg border p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-6">Order summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-red-500">
                  -${discount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-green-500">Free</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-primary">
                      ${total.toFixed(2)}
                    </span>
                    <div className="text-sm text-muted-foreground">
                      VAT included if applicable
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex gap-2">
                <Input placeholder="DISCOUNT5" />
                <Button variant="outline">Apply</Button>
              </div>
              <Button className="w-full" size="lg">
                Check out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
