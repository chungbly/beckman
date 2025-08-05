import TableSkeleton from "@/components/skeleton/table-skeleton";

function EmbedTableSkeleton() {
  const headers = ["#", "Trạng thái", "Tên", "Vị trí", "Độ bao phủ"];
  return <TableSkeleton headers={headers} rows={20} />;
}

export default EmbedTableSkeleton;
