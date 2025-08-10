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

type ProductOption = { value: number; label: string };

function ProductSelector<T extends boolean = false>({
  value,
  onChange,
  disabled,
  multiple,
  className,
  defaultValue,
}: {
  // Controlled mode props
  value?: T extends true ? number[] : number;
  onChange?: (value: T extends true ? number[] : number) => void;
  // Uncontrolled mode props
  defaultValue?: T extends true ? number[] : number;
  // Common props
  disabled?: boolean;
  multiple?: T;
  className?: string;
}) {
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");

  // Internal state for selected products (used in uncontrolled mode)
  const [internalSelectedValue, setInternalSelectedValue] = useState<
    T extends true ? number[] : number
  >(
    (defaultValue as T extends true ? number[] : number) ||
      ((multiple ? [] : 0) as any)
  );

  // Formatted selected products for AutoComplete
  const [selectedProductOptions, setSelectedProductOptions] = useState<
    ProductOption[]
  >([]);

  // Determine if we're in controlled or uncontrolled mode
  const isControlled = value !== undefined && onChange !== undefined;

  // The actual value to use (either controlled or internal state)
  const actualValue = isControlled ? value : internalSelectedValue;

  // Search products based on query
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", searchQuery],
    queryFn: async () => {
      const query = {
        searchText: searchQuery,
        status: true,
      };
      const res = await getProducts(query, 100, 1, false);
      if (res.status !== APIStatus.OK && !res.data?.length) return [];
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  // Fetch products by IDs
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

  // Debounced search handler
  const handleSearch = debounce((v: string) => setSearchQuery(v), 300);

  // Handle value change (for both controlled and uncontrolled modes)
  const handleValueChange = (newValue: T extends true ? number[] : number) => {
    if (isControlled) {
      // In controlled mode, call the onChange prop
      onChange?.(newValue);
    } else {
      // In uncontrolled mode, update internal state
      setInternalSelectedValue(newValue);
    }
  };

  // Load product details when value changes
  useEffect(() => {
    if (!actualValue) {
      setSelectedProductOptions([]);
      return;
    }

    const init = async () => {
      // Check if we already have the correct products loaded
      const valueArray = Array.isArray(actualValue)
        ? actualValue
        : [actualValue];

      if (
        selectedProductOptions.every((prd) =>
          (valueArray as number[]).includes(prd.value)
        ) &&
        selectedProductOptions.length === valueArray.length
      ) {
        return;
      }

      // Fetch product details
      const products = await fetchProducts(valueArray as number[]);

      setSelectedProductOptions(
        products.map((prd) => ({
          value: prd.kvId,
          label: prd.name,
        }))
      );
    };

    init();
  }, [actualValue]);

  // Format options for AutoComplete
  const formattedOptions = (products ?? [])
    .map((prd) => ({
      value: prd.kvId,
      label: `${prd.name} - ${prd.kvCode}`,
    }))
    .concat(selectedProductOptions)
    .reduce((acc, current) => {
      const x = acc.find((item) => item.value === current.value);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, [] as ProductOption[]);

  // Handle AutoComplete change
  const handleAutoCompleteChange = (selected: any) => {
    if (multiple) {
      if (!selected) {
        handleValueChange([] as any);
        setSelectedProductOptions([]);
        return;
      }

      const newValue = selected.map((item: ProductOption) =>
        Number(item.value)
      );
      handleValueChange(newValue as any);
      setSelectedProductOptions(selected);
    } else {
      if (!selected) {
        handleValueChange(0 as any);
        setSelectedProductOptions([]);
        return;
      }

      handleValueChange(Number(selected.value) as any);
      setSelectedProductOptions([selected]);
    }
  };

  // Render multiple select
  if (multiple) {
    return (
      <AutoComplete
        className={className}
        disabled={disabled}
        value={selectedProductOptions}
        onInputChange={handleSearch}
        options={formattedOptions}
        isLoading={isLoading}
        multiple
        placeholder="Chọn sản phẩm"
        onChange={handleAutoCompleteChange}
      />
    );
  }

  // Render single select
  return (
    <AutoComplete
      className={className}
      disabled={disabled}
      value={selectedProductOptions[0]}
      onInputChange={handleSearch}
      options={formattedOptions}
      isLoading={isLoading}
      multiple={false}
      placeholder="Chọn sản phẩm"
      onChange={handleAutoCompleteChange}
    />
  );
}

export default ProductSelector;
