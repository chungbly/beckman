import { getStaticHTML } from "@/client/static-html.client";
import { notFound } from "next/navigation";

async function StaticHTMLPage({
  params,
}: {
  params: Promise<{
    name: string;
  }>;
}) {
  const name = (await params).name;
  const res = await getStaticHTML(name);
  const staticHtml = res.data;
  if (!staticHtml?.content) notFound();

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: staticHtml.content,
      }}
    ></div>
  );
}

export default StaticHTMLPage;
