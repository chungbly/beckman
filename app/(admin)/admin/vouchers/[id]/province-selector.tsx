import { APIStatus } from "@/client/callAPI";
import { getProvinces } from "@/client/master-data.client";
import { AutoComplete } from "@/components/ui/auto-complete";
import { useQuery } from "@tanstack/react-query";

const ProvinceSelector = ({
  value,
  onChange,
}: {
  value: number[];
  onChange: (value: number[]) => void;
}) => {
  const { data: provinces, isLoading } = useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const res = await getProvinces();
      if (res.status !== APIStatus.OK || !res.data) return [];
      return res.data.map((p) => ({
        value: p.ProvinceID,
        label: p.ProvinceName,
      }));
    },
  });

  return (
    <AutoComplete
      value={provinces?.filter((p) => value?.includes(p.value)) || []}
      options={provinces ?? []}
      isLoading={isLoading}
      multiple
      placeholder="Chọn Tỉnh/Thành phố"
      onChange={(v) => onChange(v?.map((p) => p.value))}
    />
  );
};

export default ProvinceSelector;
