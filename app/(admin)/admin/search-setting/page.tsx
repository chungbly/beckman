import { getGlobalConfig } from "@/lib/configs";
import SearchSettings from "./container";
async function Page() {
  const configs = await getGlobalConfig();
  return <SearchSettings configs={configs} />;
}

export default Page;
