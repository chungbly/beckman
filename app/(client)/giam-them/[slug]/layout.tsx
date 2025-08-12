import { getVouchers } from "@/client/voucher.client";
import ProductFilter, {
  FilterSection,
} from "@/components/pages/client/category/filter";
import { Breadcrumb } from "@/components/product/breadcrumb";
import { getGlobalConfig } from "@/lib/configs";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    slug: string;
  }>;
  children: React.ReactNode;
}
export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const res = await getVouchers({
    codes: [params.slug],
  });
  const voucher = res.data?.[0];
  const previousImages = (await parent).openGraph?.images || [];

  if (voucher) {
    return {
      openGraph: {
        images: previousImages,
      },
      title: voucher.name,
      description: voucher?.description || "Beckman - Be a Classic Gentleman",
      keywords: voucher?.description || "Beckman, giay, dep",
    };
  }
  return {
    openGraph: {
      images: [...previousImages],
    },
    description: "Giảm thêm khi mua kèm ",
    title: "Giảm thêm khi mua kèm",
    keywords: "Beckman, giay, dep, giam them, discount",
  };
}
async function CategoryLayout(props: Props) {
  const configs = await getGlobalConfig();
  const params = await props.params;
  const generalFilter = configs?.["FILTER_JSON"] as FilterSection[];
  const filter = configs?.[params.slug] as FilterSection[];
  const res = await getVouchers({
    codes: [params.slug],
  });
  const voucher = res.data?.[0];
  if (!voucher) {
    return notFound();
  }
  return (
    <div className="container px-2 sm:px-4 sm:pt-2">
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: voucher.description,
          },
        ]}
        className="hidden sm:flex sm:mb-2 text-[var(--brown-brand)]"
      />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <ProductFilter filterSections={filter || generalFilter} />
        {props.children}
      </div>
    </div>
  );
}

export default CategoryLayout;
