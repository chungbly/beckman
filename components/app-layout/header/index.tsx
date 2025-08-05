import { CollectionMenu as TCollectionMenu } from "@/app/(admin)/admin/ui/collections/container";
import { getCustomer } from "@/client/customer.client";
import { getGlobalConfig } from "@/lib/configs";
import { getUserId } from "@/lib/cookies";
import { isMobileServer } from "@/lib/isMobileServer";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Marquee from "../../ui/marquee";
import CollectionMenu from "./collection-menu";
import HeaderCart from "./header-cart";
import HeaderSearch from "./header-search";
import MenuMobile from "./menu-mobile";
import HeaderUser from "./user";

const Header = async () => {
  const configs = await getGlobalConfig();
  const userId = await getUserId();
  const isMobile = await isMobileServer();
  const logoUrl = configs["LOGO"] as string;
  const notification = configs["NOTIFICATION"] as string;
  const allowRunning = configs["ALLOW_NOTIFICATION_ANIMATION"] as boolean;
  const COLLECTIONS_MENU = configs["COLLECTIONS_MENU"] as TCollectionMenu[];
  const res = userId && isMobile ? await getCustomer(userId) : null;
  const customer = res?.data;

  return (
    <header className="flex items-center bg-[var(--header-color)] py-1 h-[var(--header-mobile-height)] sm:h-[var(--header-height)] max-sm:shadow-sm sticky top-0 z-50 sm:mb-[var(--header-menu-height)]">
      <div className="container grid grid-cols-3 sm:grid-cols-5 items-center">
        <Link href="/" className="py-1">
          <Image
            src={logoUrl || "/icons/logo.png"}
            alt="R8ckie"
            sizes="(max-width: 700px) 100px, 300px"
            priority
            height={55}
            width={150}
            className="cursor-pointer w-[85px] h-[29px] sm:w-[150px] sm:h-[55px] ml-2  relative "
          />
        </Link>
        <div className="col-span-1 sm:col-span-2 pl-2 sm:px-0 flex items-center overflow-hidden">
          {notification && (
            <div className="relative overflow-hidden w-full hidden sm:block">
              <Marquee
                pauseOnHover
                pause={!allowRunning}
                repeat={allowRunning ? 4 : 1}
                className="[--duration:10s]"
              >
                <div
                  dangerouslySetInnerHTML={{ __html: notification }}
                  className={cn("hidden sm:block whitespace-nowrap ml-[50px]")}
                />
              </Marquee>
              <div className="absolute top-0 left-0 w-[50px] h-full bg-gradient-to-r from-[var(--header-color)] to-transparent" />
              <div className="absolute top-0 right-0 w-[50px] h-full bg-gradient-to-l from-[var(--header-color)] to-transparent" />
            </div>
          )}
        </div>
        <div className="sm:col-span-2 flex gap-3 sm:gap-4 items-center justify-end">
          <div className="sm:hidden flex-1">
            <HeaderSearch />
          </div>
          <CollectionMenu menus={COLLECTIONS_MENU} />
          <Link
            className="hidden sm:block p-4 text-white hover:underline"
            href="/magazine"
          >
            Magazine
          </Link>
          <Link
            className="hidden sm:block p-4 text-white hover:underline"
            href="/gioi-thieu"
          >
            About
          </Link>
          <HeaderUser />
          <HeaderCart />
          {isMobile && <MenuMobile customer={customer} />}
        </div>
      </div>
    </header>
  );
};
export default Header;
