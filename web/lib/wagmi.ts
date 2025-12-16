"use client";

import type { Chain } from "viem";
import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const chainIdEnv = Number(process.env.NEXT_PUBLIC_CHAIN_ID || baseSepolia.id);
const chain: Chain = chainIdEnv === baseSepolia.id ? baseSepolia : ({ ...baseSepolia, id: chainIdEnv } as Chain);
const chains = [chain] as const;

export const wagmiConfig = createConfig({
  chains,
  connectors: [injected({ shimDisconnect: true })],
  transports: chains.reduce<Record<number, ReturnType<typeof http>>>(
    (acc, c) => ({ ...acc, [c.id]: http() }),
    {}
  ),
  ssr: true,
});
