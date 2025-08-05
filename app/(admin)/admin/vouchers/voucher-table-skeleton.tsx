import TableSkeleton from "@/components/skeleton/table-skeleton";

function VoucherTableSkeleton() {
  const headers = [
    "#",
    "Mã đơn hàng",
    "Trạng thái",
    "Thông tin giao hàng",
    "Ghi chú",
    "Thời gian tạo",
    "Thời gian cập nhật",
  ];
  return <TableSkeleton headers={headers} rows={20} />;
}

export default VoucherTableSkeleton;
