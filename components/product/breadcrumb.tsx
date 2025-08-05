import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label?: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      className={cn(
        "flex items-center space-x-2 text-sm text-muted-foreground mb-2 sm:mb-6 flex-wrap",
        className
      )}
    >
      {items.map((item, index) => (
        <div key={item?.href || "" + index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
          <Link
            href={item.href || "#"}
            className="hover:text-[var(--gray-beige)] transition-colors overflow-hidden overflow-ellipsis line-clamp-1"
          >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}
