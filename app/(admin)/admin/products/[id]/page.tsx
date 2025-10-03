import { APIStatus } from "@/client/callAPI";
import { getProduct } from "@/client/product.client";
import { notFound } from "next/navigation";
import ProductEditPage from "./container";

async function Page(props: {
  params: Promise<{
    id: number;
  }>;
}) {
  const id = (await props.params).id;
  const res = await getProduct(id);
  if (res.status !== APIStatus.OK || !res.data) notFound();
  return <ProductEditPage product={res.data} />;
}

export default Page;
