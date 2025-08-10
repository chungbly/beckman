import { APIStatus } from "@/client/callAPI";
import { getComments } from "@/client/comment.client";
import {
  getProducts,
  getSuggestionProducts,
  getVariants,
} from "@/client/product.client";
import SimilarProducts from "@/components/pages/client/product/similar-products";
import ProductPage from "@/components/product/product-detail";
import { getGlobalConfig } from "@/lib/configs";
import { getUserId } from "@/lib/cookies";
import { getAllAvailabeCoupon } from "@/query/voucher.query";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{
    productSlug: string;
  }>;
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const { productSlug } = params;
  const userId = await getUserId();

  const res = await getProducts(
    {
      slug: productSlug,
      status: true,
      userId,
    },
    1,
    1
  );
  const product = res.data?.[0];
  const previousImages = (await parent).openGraph?.images || [];

  if (product) {
    return {
      openGraph: {
        images: product?.seo.thumbnail
          ? product.images?.[0]?.urls?.[0]
          : previousImages,
      },
      title: product?.seo?.title || "R8ckie - Step on your way",
      description: product?.seo?.description || "R8ckie - Step on your way",
      keywords: product?.seo?.keywords,
    };
  }
  return {
    openGraph: {
      images: [...previousImages],
    },
    description: "R8ckie - Step on your way",
    title: "R8ckie - Step on your way",
    keywords: "R8ckie, giay, dep",
  };
}

async function Page(props: Props) {
  const configs = await getGlobalConfig();
  const userId = await getUserId();
  const params = await props.params;
  const { productSlug } = params;

  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["getProduct", productSlug, userId],
      queryFn: async () => {
        if (!productSlug) return null;
        const res = await getProducts(
          {
            slug: productSlug,
            status: true,
            userId,
          },
          1,
          1
        );
        if (res.status !== APIStatus.OK || !res.data?.length) return null;
        return res.data[0];
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["get-product-variants", productSlug, userId],
      queryFn: async () => {
        if (!productSlug) return null;
        const res = await getVariants({
          slug: productSlug,
          userId,
        });
        if (res.status !== APIStatus.OK || !res.data) return null;
        return res.data;
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["getComments", productSlug],
      queryFn: async () => {
        if (!productSlug) return null;
        return await getComments(
          {
            productSlug,
          },
          100,
          1,
          false
        );
      },
    }),

    queryClient.prefetchQuery(getAllAvailabeCoupon),
  ]);

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductPage slug={productSlug} configs={configs} userId={userId!} />
      </HydrationBoundary>
      <div className="container mx-auto px-0 sm:py-6 max-sm:mb-[48px]">
        <SimilarProducts
          query={{
            slug: productSlug,
            status: true,
            userId,
          }}
        />
      </div>
    </>
  );
}

export default Page;
