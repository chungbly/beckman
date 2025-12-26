import { getCategoryCountByTag } from "@/client/post.client";
import { getGlobalConfig } from "@/lib/configs";
import Link from "next/link";
const getCountByTag = async (tags: string[]) => {
  const res = await getCategoryCountByTag(tags);
  if (!res || !res.data?.length) {
    return null;
  }
  return res.data;
};

async function MagazineCategoryFilter() {
  const configs = await getGlobalConfig();
  const MAGAZINE_CATEGORIES =
    (configs?.["MAGAZINE_CATEGORIES"] as string[]) || [];
  const countByTag = (await getCountByTag(MAGAZINE_CATEGORIES)) || [];
  return (
    <div className="flex flex-col gap-[20px] ">
      {countByTag.map((c) => (
        <Link
          className="hover:shadow-lg p-[10px]"
          key={c.tag}
          href={`/magazine?tags=${encodeURIComponent(c.tag)}`}
        >
          <p className="font-bold text-3xl">{c.tag}</p>
          <span>Số lượng bài viết : {c.count}</span>
        </Link>
      ))}
    </div>
  );
}

export default MagazineCategoryFilter;
