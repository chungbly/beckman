import { APIStatus } from "@/client/callAPI";
import { getBuiltCart } from "@/client/cart.client";
import { getUserId } from "@/lib/cookies";

export const getBuiltCartQuery = {
  queryKey: ["get-built-cart"],
  queryFn: async () => {
    const userId = await getUserId();
    if (!userId) return null;
    const res = await getBuiltCart(userId);
    if (res.status !== APIStatus.OK || !res.data) return null;
    return res.data;
  },
};
