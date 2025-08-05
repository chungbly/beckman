"use client";

import { APIStatus } from "@/client/callAPI";
import { createRedirect, updateRedirect } from "@/client/redirect.client";
import {
  deleteStaticHTMLs,
  updateStaticHTMLs,
} from "@/client/static-html.client";
import TablePagination from "@/components/app-layout/table-pagination";
import SumbitButton from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Redirect } from "@/types/redirect";
import { StaticHTML } from "@/types/static-html";
import { useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { Trash } from "lucide-react";
import moment from "moment";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IndeterminateCheckbox } from "../../magazines/magazine-table";

const columnHelper = createColumnHelper<StaticHTML>();

function StaticHTMLsTable({
  staticHTMLs,
  meta,
}: {
  staticHTMLs: StaticHTML[];
  meta: Meta;
}) {
  const { setAlert, closeAlert } = useAlert();
  const { toast } = useToast();
  const [data, setData] = useState(() => [...staticHTMLs]);
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const [editRow, setEditRow] = useState<Partial<Redirect> | null>(null);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const limit = Number(searchParams.get("limit")) || 10;
  const page = Number(searchParams.get("page")) || 1;

  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <div className="px-2">
            <IndeterminateCheckbox
              {...{
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler(),
              }}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="px-2">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      }),
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
              const res = await updateStaticHTMLs([
                {
                  id: info.row.original._id,
                  isActive: checked,
                },
              ]);
              if (res.status !== APIStatus.OK) {
                return toast({
                  variant: "error",
                  title: "Có lỗi xảy ra",
                  description: res?.message || "Không thể cập nhật trạng thái",
                });
              }
              window.location.reload()
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
        header: "Url gốc",
        cell: (info) => (
          <div
            className="underline text-primary cursor-pointer"
            onClick={() => {
              const filename = info.row.original.name;
              const text = info.row.original.content;

              const blob = new Blob([text], { type: "text/plain" });
              const url = URL.createObjectURL(blob);

              const a = document.createElement("a");
              a.href = url;
              a.download = filename;
              a.click();

              URL.revokeObjectURL(url);
            }}
          >
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Url đích",
        cell: (info) => moment(info.getValue()).format("DD/MM/YYYY"),
      }),
      columnHelper.accessor("updatedAt", {
        header: "Url đích",
        cell: (info) => moment(info.getValue()).format("DD/MM/YYYY"),
      }),
    ];
  }, []);
  const table = useReactTable({
    data: data,
    columns,
    state: {
      rowSelection: selectedRows,
    },
    getRowId: (row) => row._id,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setSelectedRows,
  });

  const onSubmit = async () => {
    if (!editRow) return;
    if (editRow?._id) {
      const res = await updateRedirect(editRow._id, {
        active: editRow.active,
        rootUrl: editRow.rootUrl,
        destinationUrl: editRow.destinationUrl,
      });
      if (res.status === APIStatus.OK) {
        toast({
          title: "Cập nhật thành công",
        });
        return;
      }
      toast({
        title: "Cập nhật thất bại",
        description: res.message,
        variant: "error",
      });
    } else {
      const res = await createRedirect({
        active: editRow.active,
        rootUrl: editRow.rootUrl,
        destinationUrl: editRow.destinationUrl,
      });
      if (res.status === APIStatus.OK) {
        toast({
          title: "Tạo thành công",
        });
        return;
      }
      toast({
        title: "Tạo thất bại",
        description: res.message,
        variant: "error",
      });
    }
  };
  const handleDelete = () => {
    setAlert({
      title: "Xoá file HTML",
      description: `Bạn có chắc chắn muốn xoá ${
        Object.keys(selectedRows).length
      } file HTML này không?`,
      onSubmit: async () => {
        const res = await deleteStaticHTMLs(Object.keys(selectedRows));
        if (res.status === APIStatus.OK) {
          toast({
            title: "Xoá file HTML thành công",
          });
          window.location.reload();
        } else {
          toast({
            title: "Xoá file HTML thất bại",
            description: res.message,
            variant: "error",
          });
        }
        closeAlert();
      },
    });
  };
  useEffect(() => {
    setData(staticHTMLs);
  }, [staticHTMLs]);

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
            {table.getRowModel().rows?.map((row) => (
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
      <Dialog open={!!editRow} onOpenChange={() => setEditRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thông tin Redirect</DialogTitle>
            <DialogDescription>
              Cập nhật chi tiết thông tin Redirect
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Trạng thái:</span>
              <Switch
                checked={editRow?.active ?? true}
                onCheckedChange={(checked) =>
                  setEditRow((prev) => ({
                    ...prev,
                    active: checked,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium">Url gốc:</span>
              <Input
                value={editRow?.rootUrl}
                placeholder="Nhập Url gốc"
                onChange={(e) =>
                  setEditRow((prev) => ({
                    ...prev,
                    rootUrl: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium">Url đích:</span>
              <Input
                value={editRow?.destinationUrl}
                placeholder="Nhập Url đích"
                onChange={(e) =>
                  setEditRow((prev) => ({
                    ...prev,
                    destinationUrl: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setEditRow(null);
              }}
            >
              Hủy
            </Button>
            <SumbitButton
              isDirty
              handleSubmit={async () => {
                await onSubmit();
                setEditRow(null);
                window.location.reload();
              }}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default StaticHTMLsTable;
