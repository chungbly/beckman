import { Contact } from "@/app/(admin)/admin/contact/container";
import { SupportPage } from "@/app/(admin)/admin/policy/[url]/container";
import { getGlobalConfig } from "@/lib/configs";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ClientFooterWrapper from "./client-wrapper";
import FacebookIframe from "./facebook-iframe";

const Socials = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      {/* <h4 className="text-gray-800 font-bold mb-2">Socials</h4> */}
      <div className="flex space-x-4">
        <a
          href="https://facebook.com/r8ckie"
          target="_blank"
          rel="noopener noreferrer"
          className="w-6 h-6 bg-[url(/icons/facebook.svg)] bg-contain bg-no-repeat bg-center"
        />

        <a
          href="https://instagram.com/r8ckie"
          target="_blank"
          rel="noopener noreferrer"
          className="w-6 h-6  bg-[url(/icons/instagram.svg)] bg-contain bg-no-repeat bg-center"
        />
        <a
          href="https://instagram.com/r8ckie"
          target="_blank"
          rel="noopener noreferrer"
          className="w-6 h-6  bg-[url(/icons/zalo.svg)] bg-contain bg-no-repeat bg-center"
        />
        <a
          href="https://tiktok.com/@r8ckie"
          target="_blank"
          rel="noopener noreferrer"
          className="w-6 h-6  bg-[url(/icons/tiktok.svg)] bg-contain bg-no-repeat bg-center"
        />
      </div>
    </div>
  );
};

const Footer = async () => {
  const configs = await getGlobalConfig();
  const contacts = configs?.["CONTACTS"] as Contact;
  const locations = contacts?.locations || [];
  const slogan = configs["SLOGAN"] as string;
  const DYNAMIC_SUPPORT_PAGE_LIST = configs?.[
    "DYNAMIC_SUPPORT_PAGE_LIST"
  ] as SupportPage;
  return (
    <ClientFooterWrapper>
      <div className="relative z-[1] pb-12 container grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-8 sm:px-2 px-0">
        <div className="flex items-center justify-center">
          <Image
            src="/icons/logo.svg"
            alt="Beckman Logo"
            width={220}
            height={197}
            className="w-[220px] h-[197px]"
          />
        </div>

        <div className="sm:col-span-full lg:col-span-3 grid sm:grid-cols-3 gap-4">
          {/* Support Section */}

          <div className="sm:py-16 py-2 sm:px-0 px-4 group/support ">
            <input
              type="checkbox"
              id="support-toggle-support"
              className="hidden peer/support sm:pointer-events-none pointer-events-auto"
            />
            <label
              htmlFor="support-toggle-support"
              className="font-bold peer-checked/support:mb-6 sm:mb-6 text-gray-800 flex items-center justify-between cursor-pointer sm:cursor-auto"
            >
              <h3>Services</h3>
              <ChevronRight className="block sm:hidden group-has-[input:checked]/support:rotate-90 duration-300 transition-transform" />
            </label>
            <ul className="space-y-2 list-disc list-inside h-0 peer-checked/support:h-auto sm:h-auto transition-all duration-300">
              {Object.keys(DYNAMIC_SUPPORT_PAGE_LIST || {}).map((url) => (
                <li className="underline" key={url}>
                  <Link
                    href={`/ho-tro/${url}`}
                    className=" hover:text-blue-600"
                  >
                    {DYNAMIC_SUPPORT_PAGE_LIST[url].name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Store Locations Section */}
          <div className="sm:py-16 py-4 sm:px-0 px-4">
            <h3 className=" font-bold mb-3 text-gray-800">Hệ thống cửa hàng</h3>
          </div>

          {/* About Us Section */}
          <div className="sm:py-16 py-2 sm:px-0 px-4 group/about ">
            <ul className="space-y-3 h-auto overflow-hidden transition-all duration-300">
              <FacebookIframe />
            </ul>
          </div>
        </div>
      </div>
    </ClientFooterWrapper>
  );
};

export default Footer;
