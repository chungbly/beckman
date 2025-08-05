import { getBuiltCartQuery } from "@/query/cart.query";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { CartSyncer } from ".";

async function CartSyncerSever() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(getBuiltCartQuery);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CartSyncer />
    </HydrationBoundary>
  );
}

export default CartSyncerSever;
