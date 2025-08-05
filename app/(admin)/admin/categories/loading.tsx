import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight, Pencil, Trash } from "lucide-react";
import { Fragment } from "react";

export default function CategorySkeleton() {
  // Create an array of different widths for more realistic looking skeletons
  const randomWidths = [65, 75, 85, 70, 80, 90, 60, 95];

  return (
    <div className="space-y-4 p-2 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Danh mục</h1>
        <Button disabled>+ Danh mục mới</Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Input disabled className="w-full" placeholder="Search" />
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60%]">Tên</TableHead>
              <TableHead className="w-[25%]">Trạng thái</TableHead>
              <TableHead className="w-[15%]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Main Categories */}
            {[...Array(3)].map((_, i) => (
              <Fragment key={i}>
                {/* Main Category */}
                <TableRow key={`main-${i}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      <Skeleton
                        className={`h-4 w-${
                          randomWidths[i % randomWidths.length]
                        }px`}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" disabled>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Sub Categories */}
                {[...Array(2)].map((_, j) => (
                  <TableRow key={`sub-${i}-${j}`}>
                    <TableCell>
                      <div className="flex items-center gap-2 pl-8">
                        <Skeleton
                          className={`h-4 w-${
                            randomWidths[(i + j) % randomWidths.length]
                          }px`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" disabled>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
