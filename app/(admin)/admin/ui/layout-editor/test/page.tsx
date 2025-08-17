import { getGlobalConfig } from "@/lib/configs";
import { notFound } from "next/navigation";
import { CustomPage } from "../container";
import AboutPageBuilder from "./container";

async function Page(props: { params: Promise<{ id: string }> }) {
  const configs = (await getGlobalConfig()) as Record<string, unknown>;
  const PAGE_MANAGER = configs["PAGE_MANAGER"] as CustomPage[];
  const params = await props.params;
  const { id = "56787e22-f9f2-4e46-b551-d8f904a35b01" } = params;
  const page = PAGE_MANAGER.find((p) => p.id === id);
  if (!page) {
    notFound();
  }

  return <AboutPageBuilder page={page} configs={configs} />;
}

export default Page;
