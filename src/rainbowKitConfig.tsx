"use client"; // We wamt this to be a client component / on the browser

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { anvil, zksync, mainnet } from "wagmi/chains"; // The chains we want to use

export default getDefaultConfig({
  appName: "TSender",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!, // the exclamation mark tells TypeScript we are sure this variable is defined
  chains: [anvil, zksync, mainnet],
  ssr: false, // server side rendering disabled
});
