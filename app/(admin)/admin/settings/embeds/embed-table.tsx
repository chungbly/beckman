"use client";

import { APIStatus } from "@/client/callAPI";
import { deleteEmbeds, updateEmbed } from "@/client/embed.client";
import TablePagination from "@/components/app-layout/table-pagination";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAlert } from "@/store/useAlert";
import { Meta } from "@/types/api-response";
import { Embed, EmbedPosition } from "@/types/embed";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { Plus, Trash } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { v4 } from "uuid";

const columnHelper = createColumnHelper<Embed>();

function EmbedsTable({ embeds, meta }: { embeds: Embed[]; meta: Meta }) {
  const { setAlert, closeAlert } = useAlert();
  const { toast } = useToast();
  const [data, _setData] = useState(() => [...embeds]);
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: "id",
        header: "#",
        cell: (info) => info.row.index + 1,
      }),

      columnHelper.accessor("isActive", {
        header: "Trạng thái",
        cell: (info) => (
          <Switch
            checked={info.getValue()}
            onCheckedChange={async (checked) => {
              const res = await updateEmbed(info.row.original._id, {
                isActive: checked,
              });
              if (res.status !== APIStatus.OK) {
                return toast({
                  variant: "error",
                  title: "Có lỗi xảy ra",
                  description: res?.message || "Không thể cập nhật trạng thái",
                });
              }
              toast({
                variant: "success",
                title: "Thành công",
                description: "Cập nhật trạng thái thành công",
              });
            }}
          />
        ),
      }),

      columnHelper.accessor("name", {
        header: "Tên",
        cell: (info) => (
          <Link
            className="text-primary underline"
            href={`/admin/settings/embeds/${info.row.original._id}`}
          >
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("position", {
        header: "Vị trí",
        cell: (info) => (
          <p>
            {info.getValue() === EmbedPosition.HEAD ? "Thẻ head" : "Thẻ body"}
          </p>
        ),
      }),
      columnHelper.accessor("scope", {
        header: "Độ bao phủ",
        cell: (info) => (
          <div>
            {info.getValue().map((v) => (
              <div key={v4()} className="pl-2">
                - {v}
              </div>
            ))}
          </div>
        ),
      }),
    ];
  }, []);
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
  const handleDelete = () => {
    setAlert({
      title: "Xoá lệnh Redirect",
      description: `Bạn có chắc chắn muốn xoá ${
        Object.keys(selectedRows).length
      } lệnh Redirect này không?`,
      onSubmit: async () => {
        const res = await deleteEmbeds(Object.keys(selectedRows));
        if (res.status === APIStatus.OK) {
          toast({
            title: "Xoá lệnh Redirect thành công",
          });
          window.location.reload();
        } else {
          toast({
            title: "Xoá lệnh Redirect thất bại",
            description: res.message,
            variant: "error",
          });
        }
        closeAlert();
      },
    });
  };
  useEffect(() => {
    _setData(embeds);
  }, [embeds]);

  return (
    <>
      <div className="flex justify-end gap-4">
        <Button
          variant="destructive"
          className={cn(
            "transition-all flex ease-linear duration-200 overflow-hidden",
            !!Object.keys(selectedRows).length ? "max-h-10" : "!max-h-0 p-0"
          )}
          onClick={handleDelete}
        >
          <Trash className="w-4 h-4 mr-2" />
          Xoá {Object.keys(selectedRows).length} lệnh
        </Button>
        <Link href="/admin/settings/embeds/new">
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

export default EmbedsTable;
