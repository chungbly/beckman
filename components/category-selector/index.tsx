import { getCategoryQuery } from "@/query/category.query";
import { useQuery } from "@tanstack/react-query";
import { AutoComplete } from "../ui/auto-complete";
type Option = {
  value: string;
  label: string;
};
function CategorySelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: Option[]) => void;
}) {
  const { data: categories, isLoading } = useQuery(getCategoryQuery);
  return (
    <AutoComplete
      value={
        categories
          ?.map((cate) => ({
            value: cate._id,
            label: cate.name,
          }))
          ?.filter((c) => value.includes(c.value)) ?? []
      }
      options={
        categories?.map((cate) => ({
          value: cate._id,
          label: cate.name,
        })) ?? []
      }
      isLoading={isLoading}
      multiple
      placeholder="Chọn danh mục"
      onChange={(v) => onChange(v)}
    />
  );
}

export default CategorySelector;
