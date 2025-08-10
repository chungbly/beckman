import { CategoryTree } from "@/app/(admin)/admin/categories/container";
import { getChildCategories } from "@/app/(admin)/admin/categories/page";
import { APIStatus } from "@/client/callAPI";
import { getCategories } from "@/client/category.client";
import { getCustomer } from "@/client/customer.client";
import { Menu } from "@/components/ui/navbar-menu";
import { getGlobalConfig } from "@/lib/configs";
import { getUserId } from "@/lib/cookies";
import { isMobileServer } from "@/lib/isMobileServer";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import HeaderCart from "./header-cart";
import HeaderSearch from "./header-search";
import MenuMobile from "./menu-mobile";
import { HeaderMenu } from "./desktop-menu";

const fetchCategories = async () => {
  const res = await getCategories({
    status: true,
  });
  if (res.status !== APIStatus.OK) return [];
  const categories = res.data!.map((category) => ({
    ...category,
    slug: category.seo?.slug,
    id: category._id,
  }));
  return categories;
};

const Header = async () => {
  const userId = await getUserId();
  const isMobile = await isMobileServer();
  const res = userId && isMobile ? await getCustomer(userId) : null;
  const customer = res?.data;
  const categories = await fetchCategories();

  return (
    <header
      className={cn(
        "flex items-center py-1 h-[var(--header-mobile-height)] sm:h-[var(--header-height)] max-sm:shadow-sm sticky top-0 z-50 sm:mb-[var(--header-menu-height)]",
        "bg-[url('/icons/header-pattern.svg')] bg-repeat"
      )}
    >
      <div className="container flex items-center">
        <Link href="/" className="py-1 relative top-0 sm:translate-y-[25%]">
          <Image
            src={"/icons/logo.svg"}
            alt="R8ckie"
            sizes="(max-width: 700px) 100px, 300px"
            priority
            height={96}
            width={107}
            className="relative cursor-pointer w-[52px] h-[47px] sm:w-[107px] sm:h-[96px] "
          />
        </Link>
        <div className="flex-1 flex gap-3 sm:gap-4 items-center justify-end">
          <div className="sm:hidden flex-1">
            <HeaderSearch />
          </div>
          <HeaderMenu categories={categories} />
          <HeaderCart />
          <MenuMobile customer={customer} categories={categories} />
        </div>
      </div>
    </header>
  );
};
export default Header;
