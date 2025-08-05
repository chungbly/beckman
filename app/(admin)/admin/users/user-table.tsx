"use client";

import TablePagination from "@/components/app-layout/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Meta } from "@/types/api-response";
import { AdminUser } from "@/types/user";
import { IconPhotoOff } from "@tabler/icons-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const columnHelper = createColumnHelper<AdminUser>();

const columns = [
  columnHelper.display({
    id: "id",
    header: "#",
    cell: (info) => info.row.index + 1,
  }),
  columnHelper.accessor("status", {
    header: "Trạng thái",
    cell: (info) => (
      <Badge
        className={cn(
          "",
          info.getValue() === "ACTIVE" ? "bg-green-600" : "bg-slate-500"
        )}
      >
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor("fullName", {
    header: "Họ và tên",
    cell: (info) => (
      <Link
        className="underline text-primary"
        href={`/admin/users/${info.row.original._id}`}
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => (
      <Link
        className="underline text-primary"
        href={`/admin/users/${info.row.original._id}`}
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("photo", {
    header: "Ảnh đại diện",
    cell: (info) =>
      info.getValue() ? (
        <Image
          src={info.getValue()}
          width={50}
          height={50}
          className="rounded-sm aspect-square object-cover"
          alt="magazine thumbnail for seo"
        />
      ) : (
        <IconPhotoOff className="w-[50px] h-[50px] aspect-square text-gray-500" />
      ),
  }),

  columnHelper.accessor("telegramId", {
    header: "Telegram ID",
    cell: (info) => info.getValue() || "Không xác định",
  }),
];
function UserTable({ users, meta }: { users: AdminUser[]; meta: Meta }) {
  const [data, _setData] = useState(() => [...users]);
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection: selectedRows,
    },
    getRowId: (row) => row._id,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setSelectedRows,
  });

  return (
    <>
      <div className="flex justify-end gap-4">
        <Link href="/admin/users/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tạo mới
          </Button>
        </Link>
      </div>
      <div className="border border-green-500 rounded-sm overflow-x-auto">
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

export default UserTable;
