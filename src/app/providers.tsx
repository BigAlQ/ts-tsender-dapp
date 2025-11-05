"use client";

// This file will be a list of tools that will wrap our entire app

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import config from "@/rainbowKitConfig"; // The @ symbol refers to the src/ folder
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

export function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {props.children} // all website code will be in here
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
