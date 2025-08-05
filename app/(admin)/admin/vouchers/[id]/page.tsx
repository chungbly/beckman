import { getVoucher } from "@/client/voucher.client";
import { notFound } from "next/navigation";
import VoucherForm from "./containter";

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const res = id || id !== "new" ? await getVoucher(id) : null;
  const voucher = res?.data;
  if (id && id !== "new" && !voucher) return notFound();
  return <VoucherForm voucher={voucher} id={id} />;
}

export default Page;
