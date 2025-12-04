"use client";

import TablePagination from "@/components/app-layout/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Meta } from "@/types/api-response";
import { Customer } from "@/types/customer";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import moment from "moment-timezone";

const columnHelper = createColumnHelper<Customer>();

const columns = [
  columnHelper.display({
    id: "id",
    header: "#",
    cell: (info) => info.row.index + 1,
  }),
  columnHelper.accessor("code", {
    header: "Mã khách hàng",
    cell: (info) => (
      <Link
        className="hover:underline text-primary p-2"
        href={`/admin/customers/${info.row.original._id}`}
      >
        {info.getValue() || "---"}
      </Link>
    ),
  }),
  columnHelper.accessor("name", {
    header: "Tên khách hàng",
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor("phoneNumbers", {
    header: "Số điện thoại",
    cell: (info) => (info.getValue() || []).join(", "),
  }),
  columnHelper.accessor("birthday", {
    header: "Ngày sinh",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("tier", {
    header: "Hạng thành viên",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("voucherCodes", {
    header: "Mã voucher",
    cell: (info) => info.getValue().join(", "),
  }),
  columnHelper.accessor("createdAt", {
    header: "Ngày tạo",
    cell: (info) =>
      info.getValue()
        ? moment
            .tz(info.getValue(), "Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss")
        : "Không xác định",
  }),
  columnHelper.accessor("updatedAt", {
    header: "Ngày cập nhật",
    cell: (info) =>
      info.getValue()
        ? moment
            .tz(info.getValue(), "Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss")
        : "Không xác định",
  }),
];
function CustomerTable({
  customers,
  meta,
}: {
  customers: Customer[];
  meta: Meta;
}) {
  const table = useReactTable({
    data: customers,
    columns,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="border border-green-500 rounded-sm overflow-hidden bg-white">
        <Table className="max-w-full overflow-scroll">
          <TableHeader className="bg-neutral-100 text-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination {...meta} />
      </div>
    </>
  );
}

export default CustomerTable;
