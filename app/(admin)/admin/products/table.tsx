"use client";

import { APIStatus } from "@/client/callAPI";
import { GetProductQuery, updateProductStatus } from "@/client/product.client";
import TablePagination from "@/components/app-layout/table-pagination";
import ImageCarousel from "@/components/image-carousel";
import { Badge } from "@/components/ui/badge";
import EmptyTableRow from "@/components/ui/empty-table-row";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TooltipWrap } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAlert } from "@/store/useAlert";
import { Meta } from "@/types/api-response";
import { Product } from "@/types/product";
import { formatCurrency, formatNumber } from "@/utils/number";
import { useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { ShieldCheck, ShieldMinus } from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  HTMLProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Actions from "./actions";

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

const columnHelper = createColumnHelper<Product>();

function ProductTable({
  products,
  meta,
  query,
}: {
  products: Product[];
  meta: Meta;
  query: Partial<GetProductQuery>;
}) {
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const { setAlert, closeAlert } = useAlert();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const columns = useMemo(
    () => [
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
        header: "STT",
        cell: (info) => info.row.index + 1 + meta.limit * (meta.page - 1),
      }),
      columnHelper.accessor("kvId", {
        cell: (info) => (
          <Link
            className="underline text-primary"
            href={`/admin/products/${info.getValue()}`}
          >
            {info.getValue()}
          </Link>
        ),
        header: "ID",
      }),
      columnHelper.accessor("isShow", {
        header: "Trạng thái",
        cell: (info) => {
          const handleToggle = () => {
            setAlert({
              title: "Cập nhật trạng thái",
              description: `Bạn có chắc chắn muốn ${
                info.getValue() ? "ẩn" : "hiện"
              } sản phẩm này không?`,
              onSubmit: async () => {
                const res = await updateProductStatus(
                  [info.row.original.kvId],
                  !info.getValue()
                );
                if (res.status === APIStatus.OK) {
                  toast({
                    title: "Cập nhật trạng thái thành công",
                  });
                  const limit = searchParams.get("limit") ?? 20;
                  const page = searchParams.get("page") ?? 1;
                  queryClient.invalidateQueries({
                    queryKey: [
                      "products",
                      query,
                      limit ? +limit : 20,
                      +page,
                      true,
                    ],
                  });
                } else {
                  toast({
                    title: "Cập nhật trạng thái thất bại",
                    description: res.message,
                    variant: "error",
                  });
                }
                closeAlert();
              },
            });
          };
          return (
            <Badge
              className={cn(
                "cursor-pointer",
                info.getValue() ? "bg-green-600" : "bg-slate-500"
              )}
              onClick={handleToggle}
            >
              {info.getValue() ? "Active" : "Inactive"}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("kvCode", {
        header: "Mã sản phẩm",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("images", {
        header: "Ảnh",
        cell: (info) => (
          <ImageCarousel
            sizes="200px"
            images={info
              .getValue()
              .map((d) => d.urls)
              .flat()}
          />
        ),
      }),
      columnHelper.accessor("name", {
        header: "Tên sản phẩm",
        cell: (info) => info.getValue(),
      }),

      columnHelper.accessor("categories", {
        header: "Danh mục",
        size: 200,
        minSize: 200,
        cell: (info) => (
          <ul>
            {!!info.getValue()?.length &&
              info.getValue()!.map((cate) => (
                <li className="min-w-max flex gap-1" key={cate._id}>
                  -
                  <Link
                    className="underline text-primary"
                    href={`/admin/categories/${cate?.seo?.slug}`}
                  >
                    {cate?.name}
                  </Link>
                </li>
              ))}
          </ul>
        ),
      }),
      columnHelper.accessor("basePrice", {
        header: "Giá gốc",
        cell: (info) => formatCurrency(info.getValue() || 0),
      }),
      columnHelper.accessor("salePrice", {
        header: "Giá Sale",
        cell: (info) =>
          info.getValue() ? formatCurrency(info.getValue() || 0) : "Không có",
      }),

      columnHelper.accessor("stock", {
        header: "Tồn kho",
        cell: (info) => formatNumber(info.getValue()),
      }),
      columnHelper.accessor("seo", {
        header: "Slug",
        cell: (info) => (
          <Link
            href={`/${info.getValue().slug}`}
            className="underline text-primary"
          >
            {info.getValue().slug}
          </Link>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Ngày tạo",
        cell: (info) =>
          info.getValue()
            ? moment(info.getValue()).format("DD/MM/YYYY HH:mm:ss")
            : "Không xác định",
      }),
      columnHelper.accessor("updatedAt", {
        header: "Ngày cập nhật",
        cell: (info) =>
          info.getValue()
            ? moment(info.getValue()).format("DD/MM/YYYY HH:mm:ss")
            : "Không xác định",
      }),
    ],
    [
      meta.limit,
      meta.page,
      query,
      queryClient,
      searchParams,
      toast,
      setAlert,
      closeAlert,
    ]
  );
  const table = useReactTable({
    data: products,
    state: {
      rowSelection: selectedRows,
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setSelectedRows,
    getRowId: (row) => row.kvId.toString(),
  });

  const handleChangeProductStatus = useCallback(
    async (ids: number[], status: boolean) => {
      const isAccept = await new Promise((resolve) => {
        setAlert({
          title: "Cập nhật trạng thái",
          description: `Bạn có chắc chắn muốn ${
            status ? "hiện" : "ẩn"
          } sản phẩm này không?`,
          onSubmit: () => {
            resolve(true);
            closeAlert();
          },
        });
      });
      if (!isAccept) return;
      const res = await updateProductStatus(ids, status);
      if (res.status === APIStatus.OK) {
        toast({
          title: "Cập nhật trạng thái thành công",
        });
        const limit = searchParams.get("limit") ?? 20;
        const page = searchParams.get("page") ?? 1;
        queryClient.invalidateQueries({
          queryKey: ["products", query, limit ? +limit : 20, +page, true],
        });
        setSelectedRows({});
      } else {
        toast({
          title: "Cập nhật trạng thái thất bại",
          description: res.message,
          variant: "error",
        });
      }
    },
    [query, queryClient, searchParams, toast, setAlert, closeAlert]
  );

  return (
    <>
      <Actions query={query}>
        <div
          className={cn(
            "transition-all flex ease-linear duration-200 overflow-hidden border rounded-lg border-primary p-2 h-[40px] items-center gap-2",
            !!Object.keys(selectedRows).length
              ? "max-h-10 border"
              : "!max-h-0 h-0 border-0 p-0 w-0"
          )}
        >
          <span>Đã chọn {Object.keys(selectedRows).length} </span>
          <span className="hidden sm:block">sản phẩm</span>
          <Separator orientation="vertical" className="bg-black" />
          <TooltipWrap content="Ẩn sản phẩm">
            <ShieldMinus
              onClick={() =>
                handleChangeProductStatus(
                  Object.keys(selectedRows) as unknown as number[],
                  false
                )
              }
              className="cursor-pointer w-4 h-4 mr-2 text-red-500 rounded-lg bg-neutral-100"
            />
          </TooltipWrap>
          <TooltipWrap content="Hiện sản phẩm">
            <ShieldCheck
              onClick={() =>
                handleChangeProductStatus(
                  Object.keys(selectedRows) as unknown as number[],
                  true
                )
              }
              className="cursor-pointer w-4 h-4 mr-2 text-primary rounded-lg bg-neutral-100"
            />
          </TooltipWrap>
        </div>
      </Actions>

      <div className="border border-green-500 bg-white rounded-sm max-w-full overflow-x-auto">
        <Table className="rounded-md">
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
            {!products.length && <EmptyTableRow />}
          </TableBody>
        </Table>
        <TablePagination {...meta} />
      </div>
    </>
  );
}

export default ProductTable;
