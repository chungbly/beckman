import TableSkeleton from "@/components/skeleton/table-skeleton";

function StaticHTMLTableSkeleton() {
  const headers = ["#", "Trạng thái", "Tệp HTML", "Ngày tạo", "Ngày cập nhật"];
  return <TableSkeleton headers={headers} rows={20} />;
}

export default StaticHTMLTableSkeleton;
