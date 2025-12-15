import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../components/providers";

export const metadata: Metadata = {
  title: "Family Memory Capsule",
  description: "Encrypt memories, store on IPFS, and mint unlockable NFTs on Base Sepolia.",
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
