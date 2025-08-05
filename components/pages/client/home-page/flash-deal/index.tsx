import { getProducts } from "@/client/product.client";
import { getGlobalConfig } from "@/lib/configs";
import { FlashDeal as TFlashDeal } from "@/types/flash-deal";
import moment from "moment-timezone";
import FlashDeal from "./flash-deal";
import { getUserId } from "@/lib/cookies";

async function FlashDealContainer() {
  const configs = await getGlobalConfig();
  const userId = await getUserId();

  const FLASH_DEAL = configs["FLASH_DEAL"] as TFlashDeal;
  if (!FLASH_DEAL) return null;
  const { isActive, endTime, productIds, startTime } = FLASH_DEAL;
  if (!isActive || !productIds?.length) return null;
  const now = moment.tz("Asia/Ho_Chi_Minh");
  const localStartTime = moment.tz(startTime, "Asia/Ho_Chi_Minh");
  const localEndTime = moment.tz(endTime, "Asia/Ho_Chi_Minh");
  if (!now.isBetween(localStartTime, localEndTime)) return null;
  const res = await getProducts(
    {
      ids: productIds,
      status: true,
      userId
    },
    productIds.length,
    1,
    false
  );
  const products = res.data || [];
  if (!products.length) return null;
  return <FlashDeal flashDeal={FLASH_DEAL} products={products} />;
}

export default FlashDealContainer;
