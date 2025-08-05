import { Contact } from "@/app/(admin)/admin/contact/container";
import { SupportPage } from "@/app/(admin)/admin/policy/[url]/container";
import { getGlobalConfig } from "@/lib/configs";
import { ChevronRight, Clock, MapPin } from "lucide-react";
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
      <div className="container grid grid-cols-1 sm:grid-cols-6 gap-4 sm:gap-8 sm:px-2 px-0">
        {/* Quote Section */}
        {slogan && (
          <div
            className="sm:col-span-full lg:col-span-2"
            dangerouslySetInnerHTML={{ __html: slogan }}
          />
        )}

        {/* <div style={{ backgroundColor: "#fff", padding: "2rem" }}>
          <img
            src="/icons/logo.png"
            alt="R8ckie Logo"
            style={{ width: "10rem", margin: "10px auto" }}
          />
          <blockquote
            style={{ fontStyle: "italic", color: "#374151", margin: "10px 0" }}
          >
            "Điều tuyệt vời nhất trong việc gì mà chỉ là cần làm, phải làm là
            khi mà bạn thật tâm muốn làm nó ngay, bất chấp ngày hôm và giờ đó.
            Đó là nguyên tắc đầu tiên dẫn đến thành công."
            <cite
              style={{
                display: "block",
                marginTop: "0.5rem",
                marginLeft: "50%",
                fontWeight: "bold",
              }}
            >
              - John Kennedy -
            </cite>
          </blockquote>
          <i style={{ fontSize: "0.875rem" }}>
            Hãy là chính bạn, sống là chính mình. Đừng mãi là cái bóng của người
            khác. <b>R8ckie - Stay on your way.</b>
          </i>
        </div> */}
        <div className="sm:col-span-full lg:col-span-4 grid sm:grid-cols-3 gap-4">
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
              <h3>Hỗ trợ</h3>
              <ChevronRight className="block sm:hidden group-has-[input:checked]/support:rotate-90 duration-300 transition-transform" />
            </label>
            <ul className="space-y-3 h-0 peer-checked/support:h-auto sm:h-auto overflow-hidden transition-all duration-300">
              {Object.keys(DYNAMIC_SUPPORT_PAGE_LIST || {}).map((url) => (
                <li key={url}>
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
            <div className="space-y-6">
              {locations.map((location, index) => (
                <div className="space-y-2" key={index}>
                  <p className="font-bold">
                    {location.name}:{" "}
                    <span className="font-normal">{location.address}</span>
                  </p>
                  <div className="text-sm flex flex-wrap gap-2">
                    {location.phoneNumber && (
                      <div className="flex gap-2 items-center cursor-pointer ">
                        <Clock size={16} />
                        <a
                          href={`tel:${location.phoneNumber}`}
                          className="hover:underline hover:text-blue-600"
                        >
                          {location.phoneNumber}
                        </a>
                      </div>
                    )}
                    {location.openHours && (
                      <div className="flex gap-2 items-center">
                        <Clock size={16} />
                        <span>{location.openHours}</span>
                      </div>
                    )}
                    {location.map && (
                      <div className="flex gap-2 items-center">
                        <MapPin size={16} />
                        <a
                          href={location.map}
                          target="_blank"
                          rel="noopener noreferrer "
                          className="hover:underline hover:text-blue-600"
                        >
                          Chỉ đường
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* About Us Section */}
          <div className="sm:py-16 py-2 sm:px-0 px-4 group/about ">
            <h3 className="font-bold mb-3 text-gray-800">Socials</h3>

            <ul className="space-y-3 h-auto overflow-hidden transition-all duration-300">
              <FacebookIframe />
              <li>
                <Socials className="hidden sm:block" />
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Image
        src="/icons/footerImg.png"
        alt="R8ckie-footer"
        height={76}
        width={200}
        className="hidden sm:block cursor-pointer w-[150px] h-auto absolute bottom-6 right-10"
      />
    </ClientFooterWrapper>
  );
};

export default Footer;
