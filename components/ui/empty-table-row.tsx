import Image from "next/image";
import { TableCell, TableRow } from "./table";

export const EmptyData = () => {
  return (
    <div className="flex flex-col justify-center items-center p-10">
      <Image
        src="/icons/no-data.png"
        alt="empty"
        width={100}
        height={100}
        className="mr-2"
      />
      <span className="text-gray-500">Không có dữ liệu</span>
    </div>
  );
};

function EmptyTableRow({ columns }: { columns?: number }) {
  return (
    <TableRow>
      <TableCell colSpan={columns || 9999}>
        <EmptyData />
      </TableCell>
    </TableRow>
  );
}
export default EmptyTableRow;
