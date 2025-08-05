import TableSkeleton from '@/components/skeleton/table-skeleton';

function ProductTableSkeleton() {
  const headers = [
    "STT",
    "ID",
    "Trạng thái",
    "Mã sản phẩm",
    "Ảnh",
    "Tên sản phẩm",
    "Danh mục",
    "Giá gốc",
    "Giá Sale",
    "Tồn kho",
    "Alias URL",
    "Sản phẩm liên quan",
    "Link ChatBot",
    "Ngày tạo",
    "Ngày cập nhật",
  ];
  return (
    <TableSkeleton headers={headers} rows={20} />
  )
}

export default ProductTableSkeleton