import { getCustomer } from "@/client/customer.client";
import VoucherZone from "@/components/pages/client/home-page/voucher-zone";
import { getUserId } from "@/lib/cookies";
import { Tier } from "@/types/customer";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import ExternalOrders from "./external-orders";
import InternalOrders from "./internal-orders";

export const metadata: Metadata = {
  title: "Chi tiết tài khoản",
};

async function AccountDetailPage() {
  const userId = await getUserId();

  const res = userId ? await getCustomer(userId) : null;
  const customer = res?.data;
  if (!customer) return notFound();
  return (
    <div className=" bg-[var(--light-beige)] min-h-screen">
      <div className="container space-y-2">
        <div className="relative w-full aspect-[600/388] sm:w-[600px] sm:h-[388px] rounded-lg">
          <Image
            src={
              customer.tier === Tier.VIP
                ? "/icons/vip.svg"
                : customer.tier === Tier.MEMBER
                ? "/icons/member.svg"
                : "/icons/new_member.svg"
            }
            fill
            alt="member-tier"
            className="object-contain"
            priority
          />
          <div className="absolute bottom-8 sm:bottom-14 left-8 text-white">
            <p className="text-sm sm:text-2xl">Khách hàng</p>
            <p className="text-xl sm:text-3xl font-bold">
              {customer.name || customer.phoneNumbers?.[0]}
            </p>
          </div>
        </div>
        <VoucherZone />
        <ExternalOrders customer={customer} />
        <InternalOrders customer={customer} />
      </div>
    </div>
  );
}

export default AccountDetailPage;
