import { getCategoryCountByTag } from "@/client/post.client";
import { getGlobalConfig } from "@/lib/configs";
import { isMobileServer } from "@/lib/isMobileServer";
import { cn } from "@/lib/utils";
import Link from "next/link";
const getCountByTag = async (tags: string[]) => {
  const res = await getCategoryCountByTag(tags);
  if (!res || !res.data?.length) {
    return null;
  }
  return res.data;
};

async function MagazineCategoryFilter({ tags }: { tags: string[] }) {
  const configs = await getGlobalConfig();
  const MAGAZINE_CATEGORIES =
    (configs?.["MAGAZINE_CATEGORIES"] as string[]) || [];
  const countByTag = (await getCountByTag(MAGAZINE_CATEGORIES)) || [];
  const isMobile = await isMobileServer();
  return (
    <div className="flex flex-col gap-[20px] ">
      {countByTag.map((c) => (
        <Link
          className={cn(
            "hover:shadow-lg p-2.5",
            tags.includes(c.tag) ? "border-[var(--brown-brand)] border-2" : ""
          )}
          key={c.tag}
          scroll={!isMobile}
          href={`/magazine?tags=${encodeURIComponent(c.tag)}#regular-posts`}
        >
          <p className="font-bold text-[32px]">{c.tag}</p>
          <span className="mt-2.5">Số lượng bài viết : {c.count}</span>
        </Link>
      ))}
    </div>
  );
}

export default MagazineCategoryFilter;
