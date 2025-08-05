import { getGlobalConfig } from "@/lib/configs";
import CollectionsMenu from "./container";

async function Page() {
  const configs = await getGlobalConfig();
  return <CollectionsMenu configs={configs} />;
}

export default Page;
