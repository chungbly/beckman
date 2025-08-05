import TableSkeleton from "@/components/skeleton/table-skeleton";

function CustomerTableSkeleton() {
  const headers = [
    "#",
    "Mã khách hàng",
    "Tên khách hàng",
    "Số điện thoại",
    "Ngày sinh",
    "Mã voucher",
  ];
  return <TableSkeleton headers={headers} rows={20} />;
}

export default CustomerTableSkeleton;
