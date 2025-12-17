# Family Memory Capsule

Encrypt a family photo/video in the browser with AES-256-GCM, pin the ciphertext to IPFS via Pinata, and mint a time-locked NFT on Base Sepolia. The decryption key never leaves the browser.

## Prerequisites
- Node.js 18+ (20 recommended)
- npm
- A Pinata JWT (for `pinFileToIPFS`)
- Wallet with Base Sepolia funds for gas

### Pinata JWT (quick guide)
1) Log in to Pinata → **Profile** → **API Keys** → **New Key**.
2) Enable `pinFileToIPFS` / `pinJSONToIPFS` permissions.
3) Copy the **JWT** (starts with `ey...`) and set it in `.env` / `.env.local`.

## Contracts (Hardhat)
Location: `contracts/`

Environment: create `contracts/.env` with:
```
BASE_SEPOLIA_RPC=https://sepolia.base.org
DEPLOYER_PK=0x... # private key without quotes
```

Install & deploy:
```
cd contracts
npm install
npm run compile
npm run deploy:base-sepolia
```
The script prints the deployed address; copy it into `web/.env.local` as `NEXT_PUBLIC_CONTRACT_ADDRESS`.

## Web (Next.js 14, App Router)
Location: `web/`

Create `web/.env.local`:
```
PINATA_JWT=ey...
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContract
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Install & run:
```
cd web
npm install
npm run dev
```
Open `http://localhost:3000` in a browser with an injected wallet (MetaMask, Rabby, etc.) on **Base Sepolia**.

### Base Mini App (Farcaster Frames vNext)
- Install deps (already wired in `web/package.json`): `npm install`
- Set `NEXT_PUBLIC_APP_URL` to your deployed origin (e.g. `https://your-app.vercel.app`)
- Generate `accountAssociation` via Base Build preview tool and paste into `web/accountAssociation.json`
  - https://www.base.dev/preview?tab=account
- Deploy (Vercel recommended), then verify:
  - Manifest: `https://your-app.vercel.app/.well-known/farcaster.json`
  - Frame meta: view page HTML and confirm `<meta property="fc:frame" ...>`

## Flows
- **Create:** `/create` → upload file → set unlock delay → optional allowlist → encrypt locally → upload ciphertext & metadata to Pinata → mint `mintMemory`.
- **Open:** `/open/[tokenId]` → checks `records`, `canView`, `isOpen` → when unlocked & allowed, paste the base64 key to decrypt the IPFS ciphertext. Hash is verified against on-chain `mediaHash` before decrypting.

## Scripts
- Create archive: `./scripts/zip.sh` (macOS/Linux) or `./scripts/zip.ps1` (Windows) → outputs `family-memory-capsule.zip` in repo root.

## Troubleshooting
- **RPC/chainId mismatch:** ensure wallet is on Base Sepolia (84532) and `BASE_SEPOLIA_RPC` is reachable.
- **Missing env:** set `PINATA_JWT` and `NEXT_PUBLIC_CONTRACT_ADDRESS`; restart dev server after changes.
- **Pinata 401/403:** regenerate JWT with correct permissions.
- **Type errors:** ensure Node 18+ and `npm install` completed for both `contracts/` and `web/`.

## Security
- The AES key is generated and displayed only in the browser; it is **not** stored on-chain or on IPFS. If the user loses the base64 key, the encrypted memory cannot be recovered.
