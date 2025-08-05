import { APIStatus } from "@/client/callAPI";
import { getConfigs } from "@/client/configs.client";
import { cache } from "react";

// lib/config.ts
type AppConfig = Record<string, unknown>;

/**
 * @description Get global configs, just use this for server component
 * @description for client component, use useConfigs hook instead
 * @returns {Promise<AppConfig>}
 */
export const getGlobalConfig = cache(async () => {
  try {
    const res = await getConfigs({
      isShow: true,
      isDeleted: false,
    });
    if (res.status !== APIStatus.OK || !res.data) {
      throw new Error("Cannot fetch configs");
    }
    const configs = res.data.reduce((acc, cur) => {
      try {
        acc[cur.key] = JSON.parse(cur.value);
        return acc;
      } catch (e) {
        acc[cur.key] = cur.value;
        return acc;
      }
    }, {} as AppConfig);
    return configs;
  } catch (e) {
    return {};
  }
});
