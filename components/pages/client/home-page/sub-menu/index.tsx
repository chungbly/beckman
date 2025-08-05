import { getGlobalConfig } from "@/lib/configs";
import { isMobileServer } from "@/lib/isMobileServer";
import { SubMenuLayout } from "@/types/admin-layout";
import dynamic from "next/dynamic";
const MobileSubMenuHomePage = dynamic(() => import("./mobile-submenu-item"));
const DesktopSubMenuHomePage = dynamic(() => import("./submenu-item"));

async function SubMenuHomePageContainer() {
  const configs = await getGlobalConfig();
  const SUB_MENU_HOME_PAGE = (configs["SUB_MENU_HOME_PAGE"] ||
    "{}") as SubMenuLayout;
  if (!SUB_MENU_HOME_PAGE?.items) return null;
  const isMobile = await isMobileServer();

  return (
    <div className="relative my-2">
      {isMobile ? (
        <MobileSubMenuHomePage submenu={SUB_MENU_HOME_PAGE} />
      ) : (
        <DesktopSubMenuHomePage submenu={SUB_MENU_HOME_PAGE} />
      )}
    </div>
  );
}

export default SubMenuHomePageContainer;
