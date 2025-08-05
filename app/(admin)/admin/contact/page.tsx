import { getGlobalConfig } from "@/lib/configs";
import ContactInfo from "./container";

async function Page() {
  const configs = await getGlobalConfig();
  return <ContactInfo configs={configs} />;
}

export default Page;
