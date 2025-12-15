"use client";

import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const chainIdEnv = Number(process.env.NEXT_PUBLIC_CHAIN_ID || baseSepolia.id);
const chains = [{ ...baseSepolia, id: chainIdEnv }];

export const wagmiConfig = createConfig({
  chains,
  connectors: [injected({ shimDisconnect: true })],
  transports: chains.reduce<Record<number, ReturnType<typeof http>>>(
    (acc, chain) => ({ ...acc, [chain.id]: http() }),
    {}
  ),
  ssr: true,
});
