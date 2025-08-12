import { SupportPage } from "@/app/(admin)/admin/policy/[url]/container";
import RenderHTMLFromCMS from "@/components/app-layout/render-html-from-cms";
import { Breadcrumb } from "@/components/product/breadcrumb";
import { getGlobalConfig } from "@/lib/configs";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
type Props = {
  params: Promise<{ url: string }>;
};
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const url = (await params).url;

  const configs = await getGlobalConfig();
  const DYNAMIC_SUPPORT_PAGE_LIST = configs?.[
    "DYNAMIC_SUPPORT_PAGE_LIST"
  ] as SupportPage;
  const page = DYNAMIC_SUPPORT_PAGE_LIST[url];
  const previousImages = (await parent).openGraph?.images || [];

  if (page) {
    return {
      openGraph: {
        images: previousImages,
      },
      title: page.name,
      description: page.name,
      keywords: page.name.split(" "),
    };
  }
  return {
    openGraph: {
      images: [...previousImages],
    },
    description: "Beckman - Be a Classic Gentleman",
    title: "Beckman - Be a Classic Gentleman",
    keywords: "Beckman, giay, dep, giam them, discount",
  };
}

async function Page(props: {
  params: Promise<{
    url: string;
  }>;
}) {
  const { url } = await props.params;
  const configs = await getGlobalConfig();
  const DYNAMIC_SUPPORT_PAGE_LIST = configs?.[
    "DYNAMIC_SUPPORT_PAGE_LIST"
  ] as SupportPage;
  if (!DYNAMIC_SUPPORT_PAGE_LIST) notFound();
  const page = DYNAMIC_SUPPORT_PAGE_LIST[url];
  if (!page) notFound();
  const content = (configs?.[page.key] || "") as string;
  return (
    <div className="container pt-8">
      <Breadcrumb
        items={[{ label: "Trang chủ", href: "/" }, { label: page.name }]}
        className="hidden sm:flex text-[var(--brown-brand)]"
      />
      <h1 className="text-3xl font-bold mb-4">{page.name}</h1>

      <RenderHTMLFromCMS html={content} />
    </div>
  );
}

export default Page;
