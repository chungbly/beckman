import { getAuditLogs } from "@/client/audit-log.client";
import { Breadcrumb } from "@/components/product/breadcrumb";
import { Button } from "@/components/ui/button";
import { Meta } from "@/types/api-response";
import { RefreshCcw } from "lucide-react";
import Link from "next/link";
import AuditLogFilter from "./audit-log-filter";
import AuditLogTable from "./audit-log-table";

async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { page, limit, userId, action, resource, resourceId } =
    await searchParams;
  const query = {
    userId,
    action,
    resource,
    resourceId,
  };
  const res = await getAuditLogs(
    query,
    Number(limit) || 100,
    Number(page) || 1,
    true
  );
  const auditLogs = res?.data?.items || [];
  const meta = res?.data?.meta || ({} as Meta);
  return (
    <div className="p-2 sm:p-6 flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/admin" },
          { label: "Audit Logs", href: "/admin/audit-logs" },
        ]}
      />
      <AuditLogFilter />
      <AuditLogTable auditLogs={auditLogs} meta={meta} />
    </div>
  );
}

export default Page;
