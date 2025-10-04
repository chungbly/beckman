import { getGlobalConfig } from "@/lib/configs";
import { cn } from "@/lib/utils";
import { Home, ShoppingCart } from "lucide-react";
import Link from "next/link";
import ActionBarUser from "./user";

async function MobileActionBar() {
  const configs = await getGlobalConfig();
  const FOOTER_MENU_ACTIONS_BAR = (configs?.FOOTER_MENU_ACTIONS_BAR || {}) as {
    main: {
      link: string;
      icon: string;
      isActive: boolean;
    };
    chat: string;
  };

  return (
    <nav
      className={cn(
        "actionbar h-12 fixed block sm:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      )}
    >
      <div
        className={cn(
          "grid gap-1",
          FOOTER_MENU_ACTIONS_BAR.main?.isActive ? "grid-cols-5" : "grid-cols-4"
        )}
      >
        <Link
          href="/"
          className="flex flex-col items-center justify-center p-2"
        >
          <Home className="h-5 w-5" />
        </Link>
        <Link
          href={FOOTER_MENU_ACTIONS_BAR?.chat || "#"}
          target="_blank"
          className="flex flex-col items-center justify-center p-2"
        >
          <div className="h-5 w-5 bg-[url(/icons/chat.svg)] bg-contain bg-no-repeat bg-center" />
        </Link>
        {FOOTER_MENU_ACTIONS_BAR?.main?.isActive && (
          <Link
            href={FOOTER_MENU_ACTIONS_BAR?.main?.link || "#"}
            className="flex flex-col items-center justify-center "
          >
            <div
              className="h-12 w-12 bg-[url(/icons/sale.svg)] bg-contain bg-no-repeat bg-center"
              style={{
                ...(FOOTER_MENU_ACTIONS_BAR?.main?.icon
                  ? {
                      backgroundImage: `url(${FOOTER_MENU_ACTIONS_BAR.main.icon})`,
                    }
                  : {}),
              }}
            />
          </Link>
        )}
        <Link href="/gio-hang" className="flex items-center justify-center p-2">
          <ShoppingCart className="h-5 w-5" />
        </Link>
        <ActionBarUser />
        {/* <Link
          href="/account"
          className="flex flex-col items-center justify-center p-2"
        >
          <CircleUserRound className="h-5 w-5" />
        </Link> */}
      </div>
    </nav>
  );
}

export default MobileActionBar;
