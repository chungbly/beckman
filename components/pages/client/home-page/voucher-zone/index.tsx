import { getUserId } from "@/lib/cookies";
import { getCustomerQuery } from "@/query/customer.query";
import { getCouponsQuery, getUserVouchersQuery } from "@/query/voucher.query";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import VoucherZoneContainer from "./voucher-zone";

async function VoucherZone() {
  const queryClient = new QueryClient();
  const userId = await getUserId();
  await Promise.all([
    queryClient.prefetchQuery(getCouponsQuery()),
    queryClient.prefetchQuery(getUserVouchersQuery({
      userId
    })),
    queryClient.prefetchQuery(getCustomerQuery(userId)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VoucherZoneContainer userId={userId} />
    </HydrationBoundary>
  );
}

export default VoucherZone;
