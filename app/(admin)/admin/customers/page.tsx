import { getCustomers } from "@/client/customer.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import { Meta } from "@/types/api-response";
import BulkUploadCustomer from "./bulk-upload";
import CustomerFilter from "./customer-filter";
import CustomerTable from "./customer-table";

async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { page, limit, name, code, phone, tier, voucherCodes } =
    await searchParams;
  const query = {
    name,
    code,
    phoneNumber: phone,
    tier: tier === "all" ? undefined : tier,
    voucherCodes: voucherCodes?.split(",")?.filter((v) => v !== ""),
  };
  const res = await getCustomers(
    query,
    Number(limit) || 100,
    Number(page) || 1,
    true
  );
  const customers = res?.data?.items || [];
  const meta = res?.data?.meta || ({} as Meta);
  return (
    <div className="p-6 flex flex-col gap-4">
      <PageBreadCrumb breadcrumbs={[{ name: "Danh sách khách hàng" }]} />
      <CustomerFilter />
      <BulkUploadCustomer />
      <CustomerTable customers={customers} meta={meta} />
    </div>
  );
}

export default Page;
