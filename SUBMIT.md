# Family Time Capsule

> 家族の写真や動画をタイムカプセルとして保存

## 概要
**Web3 ならではの「所有権 × プライバシー」**を重視した家族向けアプリ

## デモ

- **アプリURL**: https://farcaster.xyz/miniapps/G6WnEKlEST1a/family-memory-capsule, https://family-time-capsule.vercel.app/
- **スライド**: https://docs.google.com/presentation/d/e/2PACX-1vTdbykx6GSRt6WibdnslphsjWZ23U1qIDLu3Wgd8sKuAt1ap8o3rE5vluKSpKCccESPXKFkVfTwUU1e/pub?start=false&loop=false&delayms=3000 (Google Slides等)
- **デモ動画**(任意): 

## 推しポイント

1. **家族でタイムカプセル作成**
   - 家族の思い出の写真・動画を クライアント側で暗号化
   - 暗号化データを IPFS に保存
   - 復号鍵は **NFTごとの許可リスト（家族ウォレット）**で管理
   - 許可された家族だけが **署名ログイン（SIWE）**で閲覧可能

2. **子供へのメッセージ**
   - 自分の余命が短い場合に、ブロックチェーンを使って子供の未来に唯一無二のメッセージを残すことができる

## 使用技術(もしこだわりがあれば)

- **フロントエンド**:Next.js 14 (App Router), TypeScript, wagmi v2 + viem, @tanstack/react-query
- **ブロックチェーン**:Base / Base Sepolia, ERC721-compatible NFT, Custom permission control (allowViewer)
- **Storage & Security**:IPFS (Web3.Storage: Pinata), AES-GCM encryption (Web Crypto API), SIWE (Sign-In with Ethereum), JWT-based session

## チームメンバー

- noryxjr7 (developer etc...) - @Discord

---

*このプロジェクトは「12/13-20 大喜利.hack vibecoding mini hackathon」で作成されました*
