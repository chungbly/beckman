import TableSkeleton from "@/components/skeleton/table-skeleton";

function RedirectTableSkeleton() {
  const headers = ["#", "Trạng thái", "URL nguồn", "URL đích"];
  return <TableSkeleton headers={headers} rows={20} />;
}

export default RedirectTableSkeleton;
