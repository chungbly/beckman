"use client";

import { APIStatus } from "@/client/callAPI";
import { deleteVouchers, updateVoucher } from "@/client/voucher.client";
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAlert } from "@/store/useAlert";
import { Meta } from "@/types/api-response";
import { Voucher } from "@/types/voucher";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { Trash } from "lucide-react";
import moment from "moment-timezone";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { IndeterminateCheckbox } from "../magazines/magazine-table";

const columnHelper = createColumnHelper<Voucher>();

function VoucherTable({ vouchers, meta }: { vouchers: Voucher[]; meta: Meta }) {
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const { setAlert, closeAlert } = useAlert();
  const { toast } = useToast();
  const router = useRouter();

  const handleToggleStatus = useCallback(async (id: string, newStatus: boolean) => {
    const res = await updateVoucher(id, {
      isActive: newStatus,
    });
    if (res.status === APIStatus.OK) {
      toast({
        title: "Cập nhật trạng thái thành công",
      });
      router.refresh();
    } else {
      toast({
        title: "Cập nhật trạng thái thất bại",
        description: res.message,
        variant: "error",
      });
    }
  }, [router, toast]);

  const columns = useMemo(() => [
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
    columnHelper.accessor("code", {
      header: "Mã phiếu",
      cell: (info) => (
        <Link
          className="hover:underline text-primary p-2"
          href={`/admin/vouchers/${info.getValue()}`}
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("isActive", {
      header: "Trạng thái",
      cell: (info) => (
        <Badge
          className={cn(
            "cursor-pointer hover:opacity-80 transition-opacity",
            info.getValue() ? "bg-green-600" : "bg-slate-500"
          )}
          onClick={() => {
            setAlert({
              title: "Cập nhật trạng thái",
              description: `Bạn có chắc chắn muốn ${
                info.getValue() ? "tắt" : "bật"
              } voucher này không?`,
              onSubmit: async () => {
                await handleToggleStatus(info.row.original._id, !info.getValue());
                closeAlert();
              },
            });
          }}
        >
          {info.getValue() ? "Active" : "Inactive"}
        </Badge>
      ),
    }),
    columnHelper.accessor("name", {
      header: "Tên",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("isCoupon", {
      header: "Loại phiếu",
      cell: (info) => (info.getValue() ? "Coupon" : "Voucher"),
    }),
    columnHelper.accessor("discount.type", {
      header: "Hình thức giảm giá",
      cell: (info) =>
        info.getValue() === "percent"
          ? "Giảm theo %"
          : info.getValue() === "fixed-amount"
          ? "Giảm theo giá tiền"
          : "Giảm giá vận chuyển",
    }),
    columnHelper.accessor("quantity", {
      header: "Số lượng",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("used", {
      header: "Đã sử dụng",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("validFrom", {
      header: "Thời gian bắt đầu",
      cell: (info) =>
        info.getValue()
          ? moment
              .tz(info.getValue(), "Asia/Ho_Chi_Minh")
              .format("DD/MM/YYYY HH:mm:ss")
          : "Không xác định",
    }),
    columnHelper.accessor("validTo", {
      header: "Thời gian kết thúc",
      cell: (info) =>
        info.getValue()
          ? moment
              .tz(info.getValue(), "Asia/Ho_Chi_Minh")
              .format("DD/MM/YYYY HH:mm:ss")
          : "Không xác định",
    }),
    columnHelper.accessor("description", {
      header: "Mô tả",
      cell: (info) => info.getValue(),
    }),
    // columnHelper.accessor("createdAt", {
    //   header: "Thời gian tạo",
    //   cell: (info) =>
    //     info.getValue()
    //       ? moment(info.getValue()).format("DD/MM/YYYY HH:mm:ss")
    //       : "Không xác định",
    // }),
    // columnHelper.accessor("updatedAt", {
    //   header: "Thời gian cập nhật",
    //   cell: (info) =>
    //     info.getValue()
    //       ? moment(info.getValue()).format("DD/MM/YYYY HH:mm:ss")
    //       : "Không xác định",
    // }),
  ], [handleToggleStatus, setAlert, closeAlert]);
  const table = useReactTable({
    data: vouchers,
    columns,
    state: {
      rowSelection: selectedRows,
    },
    getRowId: (row) => row._id,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setSelectedRows,
  });
  const handleDelete = useCallback(() => {
    setAlert({
      title: "Xoá Voucher",
      description: `Bạn có chắc chắn muốn xoá ${
        Object.keys(selectedRows).length
      } Voucher này không?`,
      onSubmit: async () => {
        const res = await deleteVouchers(Object.keys(selectedRows));
        if (res.status === APIStatus.OK) {
          toast({
            title: "Xoá Voucher thành công",
          });
          router.refresh();
          setSelectedRows({});
        } else {
          toast({
            title: "Xoá Voucher thất bại",
            description: res.message,
            variant: "error",
          });
        }
        closeAlert();
      },
    });
  }, [selectedRows, router, toast, setAlert, closeAlert]);
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

export default VoucherTable;
