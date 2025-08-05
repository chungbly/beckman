import { getVouchers } from "@/client/voucher.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { Meta } from "@/types/api-response";
import { Plus } from "lucide-react";
import Link from "next/link";
import VoucherFilter from "./voucher-filter";
import VoucherTable from "./voucher-table";

async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { page, limit, isActive, isUsed, name, code, type, isCoupon ,v} =
    await searchParams;
  const query = {
    isActive:
      isActive === "true" ? true : isActive === "false" ? false : undefined,
    isUsed: isUsed === "true" ? true : isUsed === "false" ? false : undefined,
    isCoupon:
      isCoupon === "true" ? true : isCoupon === "false" ? false : undefined,
    name,
    code,
    type: type || undefined,
    v
  };
  const res = await getVouchers(
    query,
    Number(limit) || 100,
    Number(page) || 1,
    true
  );
  const vouchers = res?.data?.items || [];
  const meta = res?.data?.meta || ({} as Meta);
  return (
    <div className="p-6 flex flex-col gap-4">
      <PageBreadCrumb breadcrumbs={[{ name: "Danh sách voucher" }]} />
      <VoucherFilter />
      <div className="flex justify-end">
        <Link href="/admin/vouchers/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </Button>
        </Link>
      </div>
      <VoucherTable vouchers={vouchers} meta={meta} />
    </div>
  );
}

export default Page;
