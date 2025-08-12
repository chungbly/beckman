// app/custom-page/page.tsx

import { CustomPage } from "@/app/(admin)/admin/ui/layout-editor/container";
import { getGlobalConfig } from "@/lib/configs";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function Page() {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname");
  const configs = await getGlobalConfig();
  const PAGE_MANAGER = configs?.["PAGE_MANAGER"] as CustomPage[];
  const page = PAGE_MANAGER?.find((p) => p.id === pathname);
  if (!page || !page.html) {
    notFound();
  }
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: page.css || "",
        }}
      />
      <div
        dangerouslySetInnerHTML={{
          __html: page.html,
        }}
      />
    </>
  );
}
