"use client";

import type { Chain } from "viem";
import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const chainIdEnv = Number(process.env.NEXT_PUBLIC_CHAIN_ID || baseSepolia.id);
const chain: Chain = chainIdEnv === baseSepolia.id ? baseSepolia : ({ ...baseSepolia, id: chainIdEnv } as Chain);
const chains = [chain] as const;

const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "8cecd42f7f9b78a4973b9e8648889eda";
const wcIcon = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/icon.png`;

const connectors = [
  injected({ shimDisconnect: true }),
  ...(wcProjectId
    ? [
        walletConnect({
          projectId: wcProjectId,
          metadata: {
            name: "Family Memory Capsule",
            description: "Encrypt memories, pin to IPFS, and mint unlockable NFTs on Base.",
            url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            icons: [wcIcon],
          },
          showQrModal: true,
        }),
      ]
    : []),
];

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: chains.reduce<Record<number, ReturnType<typeof http>>>(
    (acc, c) => ({ ...acc, [c.id]: http() }),
    {}
  ),
  ssr: true,
});
