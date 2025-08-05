import { getCustomer } from "@/client/customer.client";
import { notFound } from "next/navigation";
import CustomerDetailPage from "./container";

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const res = await getCustomer(id);
  const customer = res?.data;
  if (!customer) return notFound();
  return <CustomerDetailPage customer={customer} />;
}

export default Page;
