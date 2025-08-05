import { APIStatus } from "@/client/callAPI";
import { getProducts } from "@/client/product.client";
import { AutoComplete } from "@/components/ui/auto-complete";
import { Product } from "@/types/product";
import { debounce } from "@/utils/debounce";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export const ArrayChipProduct = ({
  prdIds,
  onDelete,
}: {
  prdIds: number[];
  onDelete?: (id: number) => void;
}) => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", prdIds],
    queryFn: async () => {
      if (!prdIds.length) return [];
      const res = await getProducts(
        {
          ids: prdIds,
        },
        prdIds.length,
        1,
        false
      );
      if (res.status !== APIStatus.OK && !res.data?.length) return [];
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
  if (!prdIds?.length) return null;
  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin" />;
  return (
    <div className="flex flex-wrap gap-2">
      {products!.map((prd) => (
        <div
          key={prd.kvId}
          className="bg-gray-200 rounded-full px-2 py-1 text-sm flex items-center gap-2"
        >
          <Link
            target="_blank"
            className="hover:underline"
            href={`/admin/products/${prd.kvId}`}
          >
            {prd.name}
          </Link>
          <X
            className="h-4 w-4 ml-1 cursor-pointer bg-neutral-300 rounded-full p-1"
            onClick={() => onDelete && onDelete(prd.kvId)}
          />
        </div>
      ))}
    </div>
  );
};

function ProductSelector<T extends boolean = false>({
  value,
  onChange,
  disabled,
  multiple,
  className,
}: {
  value?: T extends true ? number[] : number;
  onChange?: (value: T extends true ? number[] : number) => void;
  disabled?: boolean;
  multiple?: T;
  className?: string;
}) {
  const [name, setName] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<
    { value: number; label: string }[]
  >([]);
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", name],
    queryFn: async () => {
      const query = {
        searchText: name,
        status: true,
      };
      const res = await getProducts(query, 100, 1, false);
      if (res.status !== APIStatus.OK && !res.data?.length) return [];
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const fetchProducts = async (ids: number[]): Promise<Product[]> => {
    if (!ids.length) return [];
    const res = await getProducts(
      {
        ids,
        status: true,
      },
      100,
      1,
      false
    );
    if (res.status !== APIStatus.OK || !res.data?.length) return [];
    return res.data;
  };

  const handleSetName = debounce((v: string) => setName(v), 300);

  useEffect(() => {
    if (!value) return;
    const init = async () => {
      if (
        selectedProducts.every((prd) =>
          Array.isArray(value) ? value.includes(prd.value) : value === prd.value
        ) &&
        selectedProducts.length === (Array.isArray(value) ? value.length : 1)
      ) {
        return;
      }
      const products = await fetchProducts(
        Array.isArray(value) ? value : [value]
      );
      setSelectedProducts(
        products.map((prd) => ({
          value: prd.kvId,
          label: prd.name,
        }))
      );
    };
    init();
  }, [value]);

  if (multiple) {
    return (
      <AutoComplete
        className={className}
        disabled={disabled}
        value={selectedProducts}
        onInputChange={(v) => handleSetName(v)}
        options={(products ?? [])
          .map((prd) => ({
            value: prd.kvId,
            label: `${prd.name} - ${prd.kvCode}`,
          }))
          .concat(selectedProducts)
          .reduce((acc, current) => {
            const x = acc.find((item) => item.value === current.value);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, [] as typeof selectedProducts)}
        isLoading={isLoading}
        multiple
        placeholder="Chọn sản phẩm"
        onChange={(v) => {
          if (!v) {
            onChange?.([] as any);
            setSelectedProducts([]);
            return;
          }
          onChange?.(v.map((c) => Number(c.value)) as any);
          setSelectedProducts(v);
        }}
      />
    );
  }

  return (
    <AutoComplete
      className={className}
      disabled={disabled}
      value={selectedProducts[0]}
      onInputChange={(v) => handleSetName(v)}
      options={(products ?? [])
        .map((prd) => ({
          value: prd.kvId,
          label: `${prd.name} - ${prd.kvCode}`,
        }))
        .concat(selectedProducts)
        .reduce((acc, current) => {
          const x = acc.find((item) => item.value === current.value);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, [] as typeof selectedProducts)}
      isLoading={isLoading}
      multiple={false}
      placeholder="Chọn sản phẩm"
      onChange={(v) => {
        if (!v) {
          onChange?.(0 as any);
          setSelectedProducts([]);
          return;
        }
        onChange?.(Number(v?.value) as any);
        setSelectedProducts([v]);
      }}
    />
  );
}

export default ProductSelector;
