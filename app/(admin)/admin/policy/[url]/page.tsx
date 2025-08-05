import { getGlobalConfig } from "@/lib/configs";
import PolicyPage from "./container";

async function Page(props: {
  params: Promise<{
    url: string;
  }>;
}) {
  const url = (await props.params).url;
  const configs = await getGlobalConfig();

  return <PolicyPage configs={configs} url={url} />;
}

export default Page;
