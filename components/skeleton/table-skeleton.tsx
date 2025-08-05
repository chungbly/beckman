import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { v4 as uuid } from "uuid";

function TableSkeleton({ headers, rows }: { headers: string[]; rows: number }) {
  return (
    <div className="border border-green-500 rounded-sm overflow-hidden">
      <Table className="max-w-full overflow-scroll">
        <TableHeader className="bg-neutral-100 text-gray-800">
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index}>
              {headers.map(() => (
                <TableCell key={uuid()}>
                  <Skeleton className="w-full h-5 bg-primary/20" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default TableSkeleton;
