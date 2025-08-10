import { getGlobalConfig } from "@/lib/configs";
import AboutPageBuilder from "./container";

async function Page() {
  const configs = await getGlobalConfig();

  return <AboutPageBuilder configs={configs} />;
}

export default Page;
