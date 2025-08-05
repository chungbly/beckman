import TableSkeleton from "@/components/skeleton/table-skeleton";

function AuditLogTableSkeleton() {
  const headers = [
    "#",
    "User ID",
    "Action",
    "Resource",
    "Resource ID",
    "Before",
    "After",
    "Thời gian"
  ];
  return <TableSkeleton headers={headers} rows={20} />;
}

export default AuditLogTableSkeleton;