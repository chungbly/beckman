import { APIStatus } from "@/client/callAPI";
import { getVouchers } from "@/client/voucher.client";
import { AutoComplete } from "@/components/ui/auto-complete";
import { Voucher } from "@/types/voucher";
import { debounce } from "@/utils/debounce";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function VoucherSelector<T extends boolean = false>({
  value,
  onChange,
  disabled,
  multiple,
  className,
}: {
  value?: T extends true ? string[] : string;
  onChange?: (value: T extends true ? string[] : string) => void;
  disabled?: boolean;
  multiple?: T;
  className?: string;
}) {
  const [code, setCode] = useState("");
  const [selectedVouchers, setSelectedVouchers] = useState<
    { value: string; label: string }[]
  >([]);
  const { data: vouchers, isLoading } = useQuery({
    queryKey: ["vouchers", code],
    queryFn: async () => {
      const query = {
        codes: code ? [code] : [],
      };
      const res = await getVouchers(query, 100, 1, false);
      if (res.status !== APIStatus.OK && !res.data?.length) return [];
      return res.data || [];
    },
    placeholderData: keepPreviousData,
  });

  const fetchVouchers = async (codes: string[]): Promise<Voucher[]> => {
    if (!codes.length) return [];
    const res = await getVouchers(
      {
        codes,
      },
      codes.length,
      1,
      false
    );
    if (res.status !== APIStatus.OK || !res.data?.length) return [];
    return res.data;
  };

  const handleSetCode = debounce((v: string) => setCode(v), 300);

  useEffect(() => {
    if (!value) return;
    const init = async () => {
      if (
        selectedVouchers.every((post) =>
          Array.isArray(value)
            ? value.includes(post.value)
            : value === post.value
        ) &&
        selectedVouchers.length === (Array.isArray(value) ? value.length : 1)
      ) {
        return;
      }
      const vouchers = await fetchVouchers(
        Array.isArray(value) ? value : [value]
      );
      setSelectedVouchers(
        vouchers.map((voucher) => ({
          value: voucher.code,
          label: voucher.name,
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
        value={selectedVouchers}
        onInputChange={(v) => handleSetCode(v)}
        options={(vouchers ?? [])
          .map((voucher) => ({
            value: voucher.code,
            label: voucher.name,
          }))
          .concat(selectedVouchers)
          .reduce((acc, current) => {
            const x = acc.find((item) => item.value === current.value);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, [] as typeof selectedVouchers)}
        isLoading={isLoading}
        multiple
        placeholder="Chọn voucher"
        onChange={(v) => {
          if (!v) {
            onChange?.([] as any);
            setSelectedVouchers([]);
            return;
          }
          onChange?.(
            v.map((c) => c.value) as T extends true ? string[] : string
          );
          setSelectedVouchers(v);
        }}
      />
    );
  }

  return (
    <AutoComplete
      className={className}
      disabled={disabled}
      value={selectedVouchers[0]}
      onInputChange={(v) => handleSetCode(v)}
      options={(vouchers ?? [])
        .map((post) => ({
          value: post.code,
          label: post.name,
        }))
        .concat(selectedVouchers)
        .reduce((acc, current) => {
          const x = acc.find((item) => item.value === current.value);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, [] as typeof selectedVouchers)}
      isLoading={isLoading}
      multiple={false}
      placeholder="Chọn voucher"
      onChange={(v) => {
        if (!v) {
          onChange?.(0 as any);
          setSelectedVouchers([]);
          return;
        }
        onChange?.(v.value as T extends true ? string[] : string);
        setSelectedVouchers([v]);
      }}
    />
  );
}

export default VoucherSelector;
