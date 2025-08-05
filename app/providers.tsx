// In Next.js, this file would be called: app/providers.tsx
"use client";

import { useConfigs } from "@/store/useConfig";
// Since QueryClientProvider relies on useContext under the hood, we have to put 'use client' on top
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Toaster = dynamic(
  () => import("@/components/ui/toaster").then((mod) => mod.Toaster),
  { ssr: false }
);
const DynamicClientScript = dynamic(
  () => import("@/components/app-layout/alert"),
  {
    ssr: false,
  }
);

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function QueryProvider({
  children,
  configs,
}: {
  children: React.ReactNode;
  configs: Record<string, unknown>;
}) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  const setConfigs = useConfigs((s) => s.setConfigs);

  useEffect(() => {
    setConfigs(configs);
  }, [configs]);
  return (
    <QueryClientProvider client={queryClient}>
      {/* <Profiler
        id="QueryProvider"
        onRender={() => {
          console.log("QueryProvider rendered");
        }}
      > */}
      {children}
      <Toaster />
      <DynamicClientScript />
      {/* </Profiler> */}
    </QueryClientProvider>
  );
}
