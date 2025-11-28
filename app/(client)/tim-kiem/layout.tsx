import ProductFilter, {
  FilterSection,
} from "@/components/pages/client/category/filter";
import { Breadcrumb } from "@/components/product/breadcrumb";
import { getGlobalConfig } from "@/lib/configs";
import { Metadata } from "next";

interface Props {
  searchParams: Promise<{
    keyword: string;
  }>;
  children: React.ReactNode;
}
export const metadata: Metadata = {
  title: "Tìm kiếm",
};
async function CategoryLayout(props: Props) {
  const configs = await getGlobalConfig();
  const filter = configs?.["FILTER_JSON"] as FilterSection[];

  return (
    <div className="container px-2 sm:px-4 mt-4 sm:mt-12">
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Tìm kiếm",
          },
        ]}
        className="hidden sm:flex sm:mb-2 text-[var(--brown-brand)]"
      />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <ProductFilter filterSections={filter} />
        {props.children}
      </div>
    </div>
  );
}

export default CategoryLayout;
