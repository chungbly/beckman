import { Contact } from "@/app/(admin)/admin/contact/container";
import { SupportPage } from "@/app/(admin)/admin/policy/[url]/container";
import { getGlobalConfig } from "@/lib/configs";
import Image from "next/image";
import Link from "next/link";
import ClientFooterWrapper from "./client-wrapper";
import FacebookIframe from "./facebook-iframe";

const Footer = async () => {
  const configs = await getGlobalConfig();
  const contacts = configs?.["CONTACTS"] as Contact;
  const socialLinks = contacts?.socialLinks || [];
  const DYNAMIC_SUPPORT_PAGE_LIST = configs?.[
    "DYNAMIC_SUPPORT_PAGE_LIST"
  ] as SupportPage;
  return (
    <ClientFooterWrapper>
      <div className="sm:absolute sm:inset-0 z-[1] container h-full grid grid-cols-1 items-center sm:grid-cols-6 sm:px-2 px-0">
        <div className="col-span-1 max-sm:hidden" />
        <div className="col-span-4 grid sm:grid-cols-3 gap-2">
          <div className="flex items-center justify-center w-full">
            <Image
              src="/icons/footer-logo.svg"
              alt="Beckman Logo"
              width={272}
              height={244}
              className="w-[272px] h-[244px]"
            />
          </div>

          <div className="sm:col-span-2 gap-4 grid sm:grid-cols-2 justify-center">
            {/* Support Section */}

            <div className="sm:py-16 py-2 sm:px-0 px-4 flex flex-col gap-4 sm:items-center">
              <div className="w-fit min-w-40">
                <h3 className="font-bold text-2xl text-[var(--brown-brand)]">
                  VỀ CHÚNG TÔI
                </h3>

                <ul className="space-y-2  transition-all duration-300">
                  <li className="text-xl">
                    <Link
                      href={`/gioi-thieu`}
                      className="hover:text-[var(--brown-brand)]"
                    >
                      Giới thiệu
                    </Link>
                  </li>
                  {Object.keys(DYNAMIC_SUPPORT_PAGE_LIST || {}).map((url) => {
                    if (
                      [
                        "faq",
                        "dich-vu-khach-hang",
                        "lien-he-phan-hoi",
                      ].includes(url)
                    )
                      return null;
                    return (
                      <li className="text-xl" key={url}>
                        <Link
                          href={`/ho-tro/${url}`}
                          className="hover:text-[var(--brown-brand)]"
                        >
                          {DYNAMIC_SUPPORT_PAGE_LIST[url].name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="w-fit min-w-40">
                <h3 className="font-bold text-2xl text-[var(--brown-brand)]">
                  DỊCH VỤ
                </h3>

                <ul className="space-y-2  transition-all duration-300">
                  {Object.keys(DYNAMIC_SUPPORT_PAGE_LIST || {}).map((url) => {
                    if (
                      ![
                        "faq",
                        "dich-vu-khach-hang",
                        "lien-he-phan-hoi",
                      ].includes(url)
                    )
                      return null;
                    return (
                      <li className="text-xl" key={url}>
                        <Link
                          href={`/ho-tro/${url}`}
                          className="hover:text-[var(--brown-brand)]"
                        >
                          {DYNAMIC_SUPPORT_PAGE_LIST[url].name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* About Us Section */}
            <div className="sm:py-16 py-2 sm:px-0 px-4 group/about ">
              <ul className="space-y-3 h-auto overflow-hidden transition-all duration-300">
                <FacebookIframe />
              </ul>
              <h3 className="font-bold text-2xl text-[var(--brown-brand)]">
                FOLLOW US
              </h3>
              <ul className="space-y-3 h-auto transition-all duration-300">
                {socialLinks.map((item) => (
                  <li key={item.name} className="text-xl uppercase">
                    <Link
                      href={item.url}
                      rel="noopener noreferrer"
                      className="hover:text-[var(--brown-brand)]"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-span-1 max-sm:hidden" />
      </div>
    </ClientFooterWrapper>
  );
};

export default Footer;
