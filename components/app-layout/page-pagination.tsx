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
import { useSearchParams } from "next/navigation";

function PagePagination({ meta = {} as Meta }: { meta: Meta }) {
  const { page: currentPage, pageCount, hasNextPage, hasPreviousPage } = meta;
  const searchParams = useSearchParams();
  const prevLink = createQueryString(searchParams, {
    page: `${currentPage - 1}`,
  });

  const getPaginationGroup = () => {
    let start = Math.max(currentPage - 2, 2);
    let end = Math.min(start + 4, pageCount - 1);

    if (end === pageCount - 1) {
      start = Math.max(end - 4, 2);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  return (
    <Pagination className="flex w-full justify-cente p-2 gap-2 sm:gap-4 flex-wrap">
      <PaginationContent className="flex-wrap justify-center">
        <PaginationItem
          className={cn(
            "",
            !hasPreviousPage && "pointer-events-none opacity-30"
          )}
        >
          <PaginationPrevious href={`?${prevLink}`} />
        </PaginationItem>
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
        {currentPage > 4 && (
          <>
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
          </>
        )}
        {pageCount > 1 && (
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
        )}

        <PaginationItem
          className={cn("", !hasNextPage && "pointer-events-none opacity-30")}
        >
          <PaginationNext
            href={`?${createQueryString(searchParams, {
              page: currentPage + 1,
            })}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default PagePagination;
