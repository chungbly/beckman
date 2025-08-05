"use client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function MagazineCategoryFilter({ categories }: { categories: string[] }) {
  const searchParams = useSearchParams();
  const tags = (searchParams.get("tags") || "").split(",").filter((tag) => tag);
  const getLink = (tag: string) => {
    if (tags?.includes(tag)) {
      return `/magazine?tags=${tags.filter((t) => t !== tag).join(",")}`;
    }
    const newTags = [...tags, tag];
    return newTags.length ? `/magazine?tags=${newTags.join(",")}` : "/magazine";
  };
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Link key={category} href={getLink(category)}>
          <Badge
            className={cn(
              "p-2 hover:bg-[var(--gray-beige)]",
              tags?.includes(category) ? "bg-[var(--rose-beige)]" : "bg-muted"
            )}
            variant="secondary"
          >
            {category}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

export default MagazineCategoryFilter;
