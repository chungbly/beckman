import { getConfigs } from "@/client/configs.client";
import ContactInfo from "./container";

async function Page() {
  const res = await getConfigs();
  const configs = res.data;
  return <ContactInfo configs={configs || []} />;
}

export default Page;
