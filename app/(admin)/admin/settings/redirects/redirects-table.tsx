"use client";

import { APIStatus } from "@/client/callAPI";
import {
  createRedirect,
  deleteRedirects,
  updateRedirect,
} from "@/client/redirect.client";
import TablePagination from "@/components/app-layout/table-pagination";
import SumbitButton from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
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
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Rocket, Trash } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IndeterminateCheckbox } from "../../magazines/magazine-table";

const columnHelper = createColumnHelper<Redirect>();

function RedirectsTable({
  redirects,
  meta,
}: {
  redirects: Redirect[];
  meta: Meta;
}) {
  const { setAlert, closeAlert } = useAlert();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [data, _setData] = useState(() => [...redirects]);
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const [editRow, setEditRow] = useState<Partial<Redirect> | null>(null);

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
      columnHelper.accessor("active", {
        header: "Trạng thái",
        cell: (info) => (
          <Badge
            className={cn(
              "",
              info.getValue() ? "bg-green-600" : "bg-slate-500"
            )}
          >
            {info.getValue() ? "Hoạt động" : "Tạm dừng"}
          </Badge>
        ),
      }),
      columnHelper.accessor("rootUrl", {
        header: "Url gốc",
        cell: (info) => (
          <Link
            className="underline text-primary"
            href={`${process.env.NEXT_PUBLIC_WEB_URL}${
              info.getValue()?.[0] === "/"
                ? info.getValue()
                : `/${info.getValue()}`
            }`}
          >
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("destinationUrl", {
        header: "Url đích",
        cell: (info) => (
          <Link
            className="underline text-primary"
            href={`${process.env.NEXT_PUBLIC_WEB_URL}/${
              info.getValue()?.[0] === "/"
                ? info.getValue()
                : `/${info.getValue()}`
            }`}
          >
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.display({
        id: "run",
        header: () => <p className="text-center">Hành động</p>,
        cell: (info) => (
          <div className="flex gap-2 items-center justify-center">
            <a
              href={`${process.env.NEXT_PUBLIC_WEB_URL}${info.row.original.rootUrl}`}
            >
              <Button variant={"outline"}>
                Chạy thử
                <Rocket className="w-4 h-4 ml-2 text-primary" />
              </Button>
            </a>
            <Button
              variant={"outline"}
              onClick={() => {
                const row = info.row.original;
                setEditRow(row);
              }}
            >
              Sửa
              <Pencil className="w-4 h-4 ml-2 text-primary" />
            </Button>
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

  const onSubmit = async () => {
    if (!editRow) return;
    if (editRow?._id) {
      const res = await updateRedirect(editRow._id, {
        active: editRow.active,
        rootUrl: editRow.rootUrl,
        destinationUrl:
          editRow.destinationUrl?.[0] === "/"
            ? editRow.destinationUrl
            : `/${editRow.destinationUrl}`,
      });
      if (res.status === APIStatus.OK) {
        toast({
          title: "Cập nhật thành công",
        });
        queryClient.invalidateQueries({ 
          queryKey: ["getRedirect", searchParams.get("rootUrl"), searchParams.get("destinationUrl"), searchParams.get("limit"), searchParams.get("page")] 
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
        destinationUrl:
          editRow.destinationUrl?.[0] === "/"
            ? editRow.destinationUrl
            : `/${editRow.destinationUrl}`,
      });
      if (res.status === APIStatus.OK) {
        toast({
          title: "Tạo thành công",
        });
        queryClient.invalidateQueries({ 
          queryKey: ["getRedirect", searchParams.get("rootUrl"), searchParams.get("destinationUrl"), searchParams.get("limit"), searchParams.get("page")] 
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
      title: "Xoá lệnh Redirect",
      description: `Bạn có chắc chắn muốn xoá ${
        Object.keys(selectedRows).length
      } lệnh Redirect này không?`,
      onSubmit: async () => {
        const res = await deleteRedirects(Object.keys(selectedRows));
        if (res.status === APIStatus.OK) {
          toast({
            title: "Xoá lệnh Redirect thành công",
          });
          queryClient.invalidateQueries({ 
            queryKey: ["getRedirect", searchParams.get("rootUrl"), searchParams.get("destinationUrl"), searchParams.get("limit"), searchParams.get("page")] 
          });
          setSelectedRows({});
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
    _setData(redirects);
  }, [redirects]);

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
        <Button onClick={() => setEditRow({} as Redirect)}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo mới
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
              }}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RedirectsTable;
