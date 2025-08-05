"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  getFileInFolderQuery,
  getSubFoldersQuery,
} from "@/query/cloudinary.query";
import { CloudinaryFile } from "@/types/cloudinary";
import { FileType } from "@/types/drive-storage";
import { bytesToSize } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import moment from "moment";
import dynamic from "next/dynamic";
import { HTMLProps, useEffect, useRef, useState } from "react";
import { useFileManager } from ".";
import { ContextMenu, ContextMenuTrigger } from "../ui/context-menu";
import { getFileIcon } from "./file-grid";

const RightMenu = dynamic(() => import("./file-right-menu"));

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

const columnHelper = createColumnHelper<CloudinaryFile>();

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
  columnHelper.accessor("display_name", {
    header: "Tên",
    cell: (info) => (
      <div className="flex gap-2 items-center">
        <div className="relative h-10 w-10">
          {getFileIcon(info.row.original)}
        </div>
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor("format", {
    header: "Loại",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("bytes", {
    header: "Kích thước",
    cell: (info) => bytesToSize(info.getValue()),
  }),
  columnHelper.accessor("created_at", {
    header: "Thời gian tạo",
    cell: (info) =>
      info.getValue()
        ? moment(info.getValue()).format("DD/MM/YYYY HH:mm:ss")
        : "Không xác định",
  }),
];
function FileTable() {
  const {
    handleDrop,
    handleOpenFolder,
    form,
    singleSelect,
    currentFolderPath,
  } = useFileManager();

  const { data: files, isLoading } = useQuery(
    getFileInFolderQuery(currentFolderPath || "")
  );

  const { data: folders, isLoading: isLoadingFolders } = useQuery(
    getSubFoldersQuery(currentFolderPath || "")
  );
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const table = useReactTable({
    data: files || [],
    columns,
    state: {
      rowSelection: selectedRows,
    },
    getRowId: (row) => row.secure_url,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setSelectedRows,
  });

  useEffect(() => {
    // @ts-ignore
    form.setFieldValue("selectedFileIds", Object.keys(selectedRows));
    if (singleSelect) {
      form.handleSubmit();
    }
  }, [selectedRows, singleSelect]);

  return (
    <div className="border border-green-500 rounded-sm overflow-scroll h-[78vh]">
      <Table className="max-w-full ">
        <TableHeader className="bg-neutral-100 text-gray-800 sticky top-0">
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
          <form.Subscribe
            selector={(state) => state.values.search}
            children={(search) => {
              let rows = table.getRowModel().rows;
              if (search) {
                rows = table
                  .getRowModel()
                  .rows.filter((row) =>
                    row.original.filename
                      .toLowerCase()
                      .includes(search.toLowerCase())
                  );
              }

              return rows.map((row) => {
                const file = row.original;
                return (
                  <ContextMenu modal={false} key={file.asset_id}>
                    <ContextMenuTrigger asChild>
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            draggable
                            onDragStart={(e) =>
                              e.dataTransfer.setData(
                                "text/plain",
                                file.asset_id
                              )
                            }
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.stopPropagation();
                              handleDrop(
                                e as unknown as React.DragEvent<HTMLButtonElement>,
                                file.asset_id
                              );
                            }}
                            onDoubleClick={() => {
                              if (file.type === FileType.GOOGLE_FOLDER) {
                                handleOpenFolder(file.asset_folder);
                              } else {
                                // @ts-ignore
                                form.setFieldValue(
                                  "imageToViewUrl",
                                  file.secure_url
                                );
                              }
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </ContextMenuTrigger>
                    <RightMenu file={file} />
                  </ContextMenu>
                );
              });
            }}
          />
        </TableBody>
      </Table>
    </div>
  );
}

export default FileTable;
