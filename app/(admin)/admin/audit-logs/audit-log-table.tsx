"use client";

import { AuditLog } from "@/client/audit-log.client";
import TablePagination from "@/components/app-layout/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Meta } from "@/types/api-response";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import moment from "moment-timezone";
import { useMemo } from "react";

const columnHelper = createColumnHelper<AuditLog>();

function AuditLogTable({
  auditLogs,
  meta,
}: {
  auditLogs: AuditLog[];
  meta: Meta;
}) {
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    });
  };
  const columns = useMemo(() => [
    columnHelper.accessor("_id.$oid", {
      header: "#",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("userId", {
      header: "User ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("action", {
      header: "Action",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("resource", {
      header: "Resource",
      cell: (info) => <div className="max-w-xs overflow-hidden text-ellipsis line-clamp-3">{info.getValue()}</div>,
    }),
    columnHelper.accessor("resourceId", {
      header: "Resource ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("success", {
      header: "Success",
      cell: (info) => (info.getValue() ? "Thành công" : "Thất bại"),
    }),
    columnHelper.accessor("before", {
      header: "Before",
      cell: (info) => {
        const before = info.getValue();
        return before ? (
          <pre
            onClick={() => handleCopy(JSON.stringify(before, null, 2))}
            className="max-w-xs overflow-auto text-xs line-clamp-3"
          >
            {JSON.stringify(before, null, 2)}
          </pre>
        ) : (
          "N/A"
        );
      },
    }),
    columnHelper.accessor("after", {
      header: "After",
      cell: (info) => {
        const after = info.getValue();
        return after ? (
          <pre
            onClick={() => handleCopy(JSON.stringify(after, null, 2))}
            className="max-w-xs overflow-auto text-xs line-clamp-3"
          >
            {JSON.stringify(after, null, 2)}
          </pre>
        ) : (
          "N/A"
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Thời gian",
      cell: (info) => {
        const date = info.getValue();
        return date ? moment(date).format("DD/MM/YYYY HH:mm:ss") : "N/A";
      },
    }),
  ],[]);

  const table = useReactTable({
    data: auditLogs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <>
      <div className="border rounded-sm overflow-y-auto bg-white">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination {...meta} />
    </>
  );
}

export default AuditLogTable;
