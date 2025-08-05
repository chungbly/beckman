"use client";

import TablePagination from "@/components/app-layout/table-pagination";
import { Badge } from "@/components/ui/badge";
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
import { Order } from "@/types/order";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import moment from "moment";
import Link from "next/link";
import { HTMLProps, useEffect, useMemo, useRef } from "react";
import { orderStages, OrderStatus } from "./[id]/order-timeline";

function IndeterminateCheckbox({
  indeterminate,
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate]);

  return (
    <input
      type="checkbox"
      ref={ref}
      {...rest}
      className={cn(
        "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      )}
    />
  );
}

const columnHelper = createColumnHelper<Order>();

function OrderTable({ orders, meta }: { orders: Order[]; meta: Meta }) {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "id",
        header: "#",
        cell: (info) => (meta.page - 1) * meta.limit + info.row.index + 1,
      }),
      columnHelper.accessor("code", {
        header: "Mã đơn hàng",
        cell: (info) => (
          <Link
            className="underline text-primary"
            href={`/admin/orders/${info.getValue()}`}
          >
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: (info) => {
          const stage = orderStages.find(
            (stage) => stage.key === info.getValue()
          );
          return (
            <Badge
              variant="outline"
              className={cn(
                "min-w-max max-w-fit text-white flex gap-2",
                stage?.key === OrderStatus.CANCEL ||
                  stage?.key === OrderStatus.DELIVERY_FAILED
                  ? "bg-red-500 "
                  : stage?.key === OrderStatus.WAIT_TO_PROCESS
                  ? "bg-yellow-400"
                  : " bg-green-500 "
              )}
            >
              {stage?.icon}
              {stage?.label}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("shippingInfo", {
        header: "Thông tin giao hàng",
        cell: (info) => (
          <div>
            <p>Tên: {info.getValue().fullName}</p>
            <p>SĐT: {info.getValue().phoneNumber}</p>
            <p>Địa chỉ: {info.getValue().address}</p>
          </div>
        ),
      }),
      columnHelper.accessor("note", {
        header: "Ghi chú",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("createdAt", {
        header: "Thời gian tạo",
        cell: (info) =>
          info.getValue()
            ? moment(info.getValue()).format("DD/MM/YYYY HH:mm:ss")
            : "Không xác định",
      }),
      columnHelper.accessor("updatedAt", {
        header: "Thời gian cập nhật",
        cell: (info) =>
          info.getValue()
            ? moment(info.getValue()).format("DD/MM/YYYY HH:mm:ss")
            : "Không xác định",
      }),
    ],
    [meta.page, meta.limit]
  );
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
  );
}

export default OrderTable;
