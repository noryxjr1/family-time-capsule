import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../components/providers";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const baseAppId = process.env.NEXT_PUBLIC_BASE_APP_ID ?? "REPLACE_ME_BASE_APP_ID";

const frame = {
  version: "1",
  imageUrl: `${appUrl}/og-image.png`,
  button: {
    title: "Open app",
    action: {
      type: "launch_frame",
      name: "Family Memory Capsule",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#ffffff",
    },
  },
};

export const metadata: Metadata = {
  title: "Family Memory Capsule",
  description: "Encrypt memories, store on IPFS, and mint unlockable NFTs on Base Sepolia.",
  other: {
    "fc:frame": JSON.stringify(frame),
    "base:app_id": baseAppId,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main>
            <nav>
              <a className="badge" href="/">Family Memory Capsule</a>
              <a href="/create">Create</a>
            </nav>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
