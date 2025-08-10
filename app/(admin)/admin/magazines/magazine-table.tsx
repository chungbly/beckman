"use client";

import { APIStatus } from "@/client/callAPI";
import { deletePosts } from "@/client/post.client";
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
import { getPostsQuery } from "@/query/post.query";
import { useAlert } from "@/store/useAlert";
import { Post } from "@/types/post";
import { IconPhotoOff } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { Trash } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { HTMLProps, useEffect, useRef, useState } from "react";
import MagazineTableSkeleton from "./magazine-table-skeleton";

export function IndeterminateCheckbox({
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

const columnHelper = createColumnHelper<Post>();

const columns = [
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
  columnHelper.accessor("isShow", {
    header: "Trạng thái",
    cell: (info) => (
      <Badge
        className={cn("", info.getValue() ? "bg-green-600" : "bg-slate-500")}
      >
        {info.getValue() ? "Active" : "Inactive"}
      </Badge>
    ),
  }),
  columnHelper.accessor("title", {
    header: "Tên bài viết",
    cell: (info) => (
      <Link
        className="underline text-primary"
        href={`/admin/magazines/${info.row.original._id}`}
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("seo", {
    header: "Ảnh đại diện",
    cell: (info) =>
      info.getValue()?.thumbnail ? (
        <Image
          src={info.getValue().thumbnail!}
          width={50}
          height={50}
          className="rounded-sm aspect-square object-cover"
          alt="magazine thumbnail for seo"
        />
      ) : (
        <IconPhotoOff className="w-[50px] h-[50px] aspect-square text-gray-500" />
      ),
  }),
  columnHelper.accessor("tags", {
    header: "Tag",
    cell: (info) => (
      <div className="flex flex-wrap gap-2">
        {info.getValue()?.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
    ),
  }),

  columnHelper.accessor("isOutStanding", {
    header: "Nổi bật",
    cell: (info) => (
      <Badge
        className={cn(
          "min-w-fit",
          info.getValue() ? "bg-green-600" : "bg-slate-500"
        )}
      >
        {info.getValue() ? "Nổi bật" : "Không"}
      </Badge>
    ),
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
];
function MagazineTable({
  query,
}: {
  query: {
    page: number;
    title: string;
    isShow: boolean;
    authorId: string;
  };
}) {
  const { setAlert, closeAlert } = useAlert();
  const { toast } = useToast();
  const { data: magazines, isLoading } = useQuery(getPostsQuery(query));
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const table = useReactTable({
    data: magazines?.items || [],
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
      title: "Xoá bài viết",
      description: `Bạn có chắc chắn muốn xoá ${
        Object.keys(selectedRows).length
      } bài viết này không?`,
      onSubmit: async () => {
        const res = await deletePosts(Object.keys(selectedRows));
        if (res.status === APIStatus.OK) {
          toast({
            title: "Xoá bài viết thành công",
          });
        } else {
          toast({
            title: "Xoá bài viết thất bại",
            description: res.message,
            variant: "error",
          });
        }
        closeAlert();
      },
    });
  };

  if (isLoading) return <MagazineTableSkeleton />;

  return (
    <>
      <div className="flex justify-end ">
        <Button
          variant="destructive"
          className={cn(
            "transition-all flex ease-linear duration-200 overflow-hidden",
            !!Object.keys(selectedRows).length ? "max-h-10" : "!max-h-0 p-0"
          )}
          onClick={handleDelete}
        >
          <Trash className="w-4 h-4 mr-2" />
          Xoá {Object.keys(selectedRows).length} bài viết
        </Button>
      </div>
      <div className="border border-green-500 rounded-sm max-w-full overflow-scroll bg-white">
        <Table>
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
        <TablePagination {...magazines!.meta} />
      </div>
    </>
  );
}

export default MagazineTable;
