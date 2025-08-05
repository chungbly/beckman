import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

function ClientPagination({
  totalPage,
  currentPage,
  onChange,
  className,
}: {
  totalPage: number;
  className?: string;
  currentPage: number;
  onChange: (page: number) => void;
}) {
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPage;
  const getPaginationGroup = () => {
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + 4, totalPage);

    if (end === totalPage) {
      start = Math.max(end - 4, 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <Pagination className={cn("flex justify-end p-2 gap-4", className)}>
      <PaginationContent>
        {hasPreviousPage && (
          <Button variant="ghost" onClick={() => onChange(currentPage - 1)}>
            <ChevronLeft />
          </Button>
        )}

        {currentPage > 4 && (
          <>
            <PaginationItem>
              <Button
                variant="ghost"
                className={cn(
                  "rounded-lg",
                  currentPage == 1
                    ? "bg-primary text-white"
                    : "hover:bg-primary/50 hover:text-white"
                )}
              >
                1
              </Button>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}

        {getPaginationGroup().map((page) => (
          <PaginationItem key={page}>
            <Button
              variant="ghost"
              onClick={() => onChange(page)}
              className={cn(
                "rounded-lg",
                currentPage == page
                  ? "bg-primary text-white"
                  : "hover:bg-primary/50 hover:text-white"
              )}
            >
              {page}
            </Button>
          </PaginationItem>
        ))}

        {currentPage < totalPage - 3 && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <Button
                variant="ghost"
                onClick={() => onChange(totalPage)}
                className={cn(
                  "rounded-lg",
                  currentPage == totalPage
                    ? "bg-primary text-white"
                    : "hover:bg-primary/50 hover:text-white"
                )}
              >
                {totalPage}
              </Button>
            </PaginationItem>
          </>
        )}

        {hasNextPage && (
          <PaginationItem>
            <Button variant="ghost" onClick={() => onChange(currentPage + 1)}>
              <ChevronRight />
            </Button>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}

export default ClientPagination;
