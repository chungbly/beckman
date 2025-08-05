import { APIStatus } from "@/client/callAPI";
import { getConfigs } from "@/client/configs.client";

export const getConfigsQuery = {
  queryKey: ["get-configs"],
  queryFn: async () => {
    const res = await getConfigs();
    if (res.status !== APIStatus.OK || !res.data?.length) return {};
    return res.data.reduce((acc, cur) => {
      try {
        acc[cur.key] = JSON.parse(cur.value);
        return acc;
      } catch (e) {
        acc[cur.key] = cur.value;
        return acc;
      }
    }, {} as Record<string, unknown>);
  },
};
