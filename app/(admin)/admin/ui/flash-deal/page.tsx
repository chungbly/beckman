import FlashDealEditor from "@/components/pages/admin/ui/flash-deal";
import { getGlobalConfig } from "@/lib/configs";
import { FlashDeal } from "@/types/flash-deal";

async function FlashDealAdminPage() {
  const configs = await getGlobalConfig();
  const FLASH_DEAL = configs["FLASH_DEAL"] as FlashDeal;

  return <FlashDealEditor initialData={FLASH_DEAL} />;
}

export default FlashDealAdminPage;
