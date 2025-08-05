import TableSkeleton from "@/components/skeleton/table-skeleton";

function MagazineTableSkeleton() {
  const headers = [
    "#",
    "Trạng thái",
    "Tên bài viết",
    "Ảnh đại diện",
    "Thời gian tạo",
    "Thời gian cập nhật",
  ];
  return <TableSkeleton headers={headers} rows={20} />;
}

export default MagazineTableSkeleton;
