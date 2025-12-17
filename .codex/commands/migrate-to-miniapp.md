---
description: 既存のWebアプリをBase Mini Appに移行する
---

# 既存アプリをBase Mini Appに移行する

既存のウェブアプリケーションをBase App用のmini appに変換してください。以下の9つのステップに従って実装します。

## ステップ1: MiniApp SDKのインストール

```bash
npm install @farcaster/miniapp-sdk
```

## ステップ2: アプリケーションの表示トリガー

SDKの `ready()` メソッドを呼び出してローディング画面を非表示にします。

**Reactの場合:**
```typescript
import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return <YourApp />;
}
```

再レンダリングを避けるため、できるだけ早期に呼び出してください。

## ステップ3: マニフェストファイルの配置

`/.well-known/farcaster.json` にマニフェストファイルを配置します。

**Next.js App Routerの場合 (`app/.well-known/farcaster.json/route.ts`):**
```typescript
export async function GET() {
  const manifest = {
    // ステップ4で設定
  };

  return Response.json(manifest);
}
```

## ステップ4: マニフェストの設定

以下の必須フィールドを設定:

```json
{
  "accountAssociation": {
    "header": "生成されたヘッダー",
    "payload": "生成されたペイロード",
    "signature": "生成された署名"
  },
  "frame": {
    "version": "next",
    "name": "アプリ名",
    "homeUrl": "https://your-domain.com",
    "iconUrl": "https://your-domain.com/icon.png",
    "splashImageUrl": "https://your-domain.com/splash.png",
    "splashBackgroundColor": "#ffffff"
  }
}
```

## ステップ5: アカウント関連情報の生成

Base Buildツール (https://www.base.dev/preview?tab=account) を使用して、マニフェストの `accountAssociation` フィールドを生成します:
- header
- payload
- signature

ここでは、accountAssociation.jsonにユーザーに用意してもらいましょう
Vercel にデプロイしてなかったらデプロイを促してください

## ステップ6: 埋め込みメタデータの追加

HTMLの`<head>`に以下のメタタグを追加:

```html
<meta property="fc:frame" content='{"version":"next","imageUrl":"https://your-domain.com/og-image.png","button":{"title":"アプリを開く","action":{"type":"launch_frame","name":"アプリ名","url":"https://your-domain.com","splashImageUrl":"https://your-domain.com/splash.png","splashBackgroundColor":"#ffffff"}}}' />
```

**Next.jsの場合 (Metadata API):**
```typescript
export const metadata: Metadata = {
  other: {
    'fc:frame': JSON.stringify({
      version: 'next',
      imageUrl: 'https://your-domain.com/og-image.png',
      button: {
        title: 'アプリを開く',
        action: {
          type: 'launch_frame',
          name: 'アプリ名',
          url: 'https://your-domain.com',
          splashImageUrl: 'https://your-domain.com/splash.png',
          splashBackgroundColor: '#ffffff'
        }
      }
    })
  }
};
```

## ステップ7: 本番環境へのデプロイ

すべての変更を本番環境にデプロイします。

## ステップ8: プレビュー検証

Base Buildのプレビューツールで以下を検証:
- 埋め込みの表示
- アカウント関連情報の正確性
- マニフェストの読み込み

## ステップ9: Base Appでの公開

アプリURLを含む投稿をBase appに作成して公開します。

---

## 実装タスク

上記のステップに従って、このプロジェクトをBase Mini Appに移行してください:

1. SDKをインストール
2. `ready()` 呼び出しを追加
3. マニフェストエンドポイントを作成
4. メタタグを設定
5. デプロイして検証

