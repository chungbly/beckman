import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ConfigManagementSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-64 bg-neutral-200" />
        <Skeleton className="h-10 w-36 bg-neutral-200" />
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Skeleton className="h-10 w-full bg-neutral-200" />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Skeleton className="h-4 w-8 bg-neutral-200" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24 bg-neutral-200" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-32 bg-neutral-200" />
              </TableHead>
              <TableHead className="w-[200px]">
                <Skeleton className="h-4 w-16 bg-neutral-200" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(20)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-8 bg-neutral-200" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full bg-neutral-200" />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
