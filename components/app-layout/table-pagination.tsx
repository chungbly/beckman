import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { Meta } from "@/types/api-response";
import { createQueryString } from "@/utils/search-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

function TablePagination({
  itemCount,
  limit,
  page: currentPage,
  pageCount,
  hasNextPage,
  hasPreviousPage,
}: Meta) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prevLink = createQueryString(searchParams, {
    page: `${currentPage - 1}`,
  });

  const getPaginationGroup = () => {
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + 4, pageCount);

    if (end === pageCount) {
      start = Math.max(end - 4, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  return (
    <Pagination className="flex justify-end bg-neutral-100 p-2 gap-4">
      <div className="flex items-center gap-4">
        <Select
          value={limit?.toString() || "20"}
          onValueChange={(value) => {
            router.push(
              `?${createQueryString(searchParams, { limit: value, page: 1 })}`
            );
          }}
        >
          <SelectTrigger className="w-fit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-neutral-600">
          Hiển thị {currentPage * limit - limit + 1 || 0} -{" "}
          {(currentPage * limit > itemCount
            ? itemCount
            : currentPage * limit) || 0}{" "}
          của {itemCount || 0}
        </span>
      </div>
      <PaginationContent>
        {hasPreviousPage && (
          <PaginationItem>
            <PaginationPrevious href={`?${prevLink}`} />
          </PaginationItem>
        )}

        {currentPage > 4 && (
          <>
            <PaginationItem>
              <PaginationLink
                href={`?${createQueryString(searchParams, {
                  page: 1,
                })}`}
                isActive={currentPage == 1}
                className={cn(
                  "rounded-lg",
                  currentPage == 1
                    ? "bg-primary text-white"
                    : "hover:bg-primary/50 hover:text-white"
                )}
              >
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}

        {getPaginationGroup().map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={`?${createQueryString(searchParams, {
                page,
              })}`}
              isActive={currentPage == page}
              className={cn(
                "rounded-lg",
                currentPage == page
                  ? "bg-primary text-white"
                  : "hover:bg-primary/50 hover:text-white"
              )}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {currentPage < pageCount - 3 && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href={`?${createQueryString(searchParams, {
                  page: pageCount,
                })}`}
                isActive={currentPage == pageCount}
                className={cn(
                  "rounded-lg",
                  currentPage == pageCount
                    ? "bg-primary text-white"
                    : "hover:bg-primary/50 hover:text-white"
                )}
              >
                {pageCount}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        {hasNextPage && (
          <PaginationItem>
            <PaginationNext
              href={`?${createQueryString(searchParams, {
                page: currentPage + 1,
              })}`}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}

export default TablePagination;
