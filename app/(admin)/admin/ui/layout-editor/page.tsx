import { getGlobalConfig } from "@/lib/configs";
import AboutPageBuilder from "./container";
import PageManager from "./container";

async function Page() {
  const configs = await getGlobalConfig();

  return <PageManager configs={configs} />;
}

export default Page;
