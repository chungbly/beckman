import { APIStatus } from "@/client/callAPI";
import { getConfigs } from "@/client/configs.client";
import { AutoComplete } from "@/components/ui/auto-complete";
import { useQuery } from "@tanstack/react-query";
type Option = {
  value: string;
  label: string;
};
function PageSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const { data: pages, isLoading } = useQuery({
    queryKey: ["getPages"],
    queryFn: async () => {
      const res = await getConfigs();
      if (res.status !== APIStatus.OK) return [];
      const pagesValue = res.data?.find((c) => c.key === "PAGES");
      const pages = JSON.parse(pagesValue?.value ?? "[]") as string[];
      return pages;
    },
  });
  return (
    <AutoComplete
      value={
        pages
          ?.map((page) => ({
            value: page,
            label: page,
          }))
          ?.filter((c) => value?.includes(c.value)) ?? []
      }
      options={
        pages?.map((page) => ({
          value: page,
          label: page,
        })) ?? []
      }
      isLoading={isLoading}
      multiple
      placeholder="Chọn trang"
      onChange={(v) => onChange((v as Option[]).map((c) => c.value))}
    />
  );
}

export default PageSelector;
