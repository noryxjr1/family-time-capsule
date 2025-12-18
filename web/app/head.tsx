export default function Head() {
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

  return (
    <>
      <meta property="fc:frame" content={JSON.stringify(frame)} />
      <meta property="base:app_id" content={baseAppId} />
    </>
  );
}
